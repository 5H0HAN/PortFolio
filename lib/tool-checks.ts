import { isIP } from "node:net";
import { domainToASCII } from "node:url";

export type ReportStatus = "pass" | "warn" | "fail";

export interface ReportCheck {
  title: string;
  status: ReportStatus;
  statusText: string;
  description: string;
  details?: string[];
}

export interface DomainDiagnostic {
  domain: string;
  checks: ReportCheck[];
  score: number;
  summary: string;
  suggestions: string[];
}

type DnsRecordType = "TXT" | "MX" | "A" | "AAAA";

type DnsAnswer = {
  data?: unknown;
  type?: unknown;
};

type DnsJsonResponse = {
  Status?: unknown;
  Answer?: unknown;
};

type CachedDnsRecords = {
  expiresAt: number;
  records: string[];
};

const DNS_RECORD_TYPES: Record<DnsRecordType, number> = {
  A: 1,
  MX: 15,
  TXT: 16,
  AAAA: 28,
};
const DNS_LOOKUP_TIMEOUT_MS = 6_000;
const DNS_CACHE_TTL_MS = 60_000;
const DNS_CACHE_MAX_ENTRIES = 250;
const MAX_DNS_ANSWERS = 50;
const MAX_MX_HOSTS = 20;

const dnsCache = new Map<string, CachedDnsRecords>();
const dnsInFlight = new Map<string, Promise<string[]>>();

const GOOGLE_MX_RECORDS = new Set([
  "smtp.google.com",
  "aspmx.l.google.com",
  "alt1.aspmx.l.google.com",
  "alt2.aspmx.l.google.com",
  "alt3.aspmx.l.google.com",
  "alt4.aspmx.l.google.com",
  "alt5.aspmx.l.google.com",
  "aspmx2.googlemail.com",
  "aspmx3.googlemail.com",
  "aspmx4.googlemail.com",
  "aspmx5.googlemail.com",
]);

export class DiagnosticInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DiagnosticInputError";
  }
}

export function normalizeDomainInput(raw: string): string {
  const value = raw.trim();
  if (!value || value.length > 2_048) {
    throw new DiagnosticInputError("Enter a valid domain name.");
  }

  let parsed: URL;
  try {
    parsed = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `http://${value}`);
  } catch {
    throw new DiagnosticInputError("Enter a valid domain name.");
  }

  if (parsed.username || parsed.password) {
    throw new DiagnosticInputError("Enter a domain, not an email address or credentialed URL.");
  }

  const domain = domainToASCII(parsed.hostname.replace(/\.$/, "")).toLowerCase();
  const labels = domain.split(".");
  const validLabels = labels.every(
    (label) =>
      label.length > 0 &&
      label.length <= 63 &&
      /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label),
  );

  if (
    !domain ||
    domain.length > 253 ||
    labels.length < 2 ||
    !validLabels ||
    isIP(domain) !== 0
  ) {
    throw new DiagnosticInputError("Enter a public domain such as example.com.");
  }

  return domain;
}

const normalizeTxt = (value: string) => {
  const quotedSegments = value.match(/"([^"]*)"/g);
  if (quotedSegments && quotedSegments.length > 0) {
    return quotedSegments
      .map((segment) => segment.slice(1, -1).replace(/\\"/g, '"'))
      .join("")
      .trim()
      .toLowerCase();
  }

  return value
    .replace(/^"+|"+$/g, "")
    .replace(/\\"/g, '"')
    .trim()
    .toLowerCase();
};

const pruneDnsCache = () => {
  const now = Date.now();
  for (const [key, value] of dnsCache) {
    if (value.expiresAt <= now) {
      dnsCache.delete(key);
    }
  }

  while (dnsCache.size >= DNS_CACHE_MAX_ENTRIES) {
    const oldestKey = dnsCache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    dnsCache.delete(oldestKey);
  }
};

const readCachedDnsRecords = (key: string) => {
  const cached = dnsCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    dnsCache.delete(key);
    return null;
  }

  dnsCache.delete(key);
  dnsCache.set(key, cached);
  return [...cached.records];
};

const requestDnsRecords = async (
  name: string,
  type: DnsRecordType,
): Promise<string[]> => {
  const url = new URL("https://dns.google/resolve");
  url.searchParams.set("name", name);
  url.searchParams.set("type", type);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      cache: "no-store",
      headers: { Accept: "application/dns-json" },
      signal: AbortSignal.timeout(DNS_LOOKUP_TIMEOUT_MS),
    });
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "";
    if (errorName === "AbortError" || errorName === "TimeoutError") {
      throw new Error(`DNS lookup timed out for ${name} (${type}).`);
    }
    throw new Error(`DNS lookup failed for ${name} (${type}).`);
  }

  if (!response.ok) {
    throw new Error(`DNS lookup failed for ${name} (${type}).`);
  }

  const data = (await response.json()) as DnsJsonResponse;
  if (data.Status === 3) return [];
  if (data.Status !== undefined && data.Status !== 0) {
    throw new Error(`DNS resolver returned status ${String(data.Status)} for ${name}.`);
  }
  if (!Array.isArray(data.Answer)) return [];

  const expectedType = DNS_RECORD_TYPES[type];
  return (data.Answer as DnsAnswer[])
    .filter(
      (answer) =>
        answer.type === expectedType &&
        typeof answer.data === "string" &&
        answer.data.length <= 4_096,
    )
    .slice(0, MAX_DNS_ANSWERS)
    .map((answer) => answer.data as string);
};

const fetchDnsRecords = async (
  name: string,
  type: DnsRecordType,
): Promise<string[]> => {
  const key = `${type}:${name.toLowerCase()}`;
  const cached = readCachedDnsRecords(key);
  if (cached) return cached;

  const pending = dnsInFlight.get(key);
  if (pending) return [...(await pending)];

  const lookup = requestDnsRecords(name, type)
    .then((records) => {
      pruneDnsCache();
      dnsCache.set(key, {
        expiresAt: Date.now() + DNS_CACHE_TTL_MS,
        records: [...records],
      });
      return records;
    })
    .finally(() => dnsInFlight.delete(key));

  dnsInFlight.set(key, lookup);
  return [...(await lookup)];
};

const evaluateRecord = (status: ReportStatus): number => {
  if (status === "pass") return 100;
  if (status === "warn") return 50;
  return 0;
};

const rankStatus = (checks: ReportCheck[]): ReportStatus => {
  if (checks.some((check) => check.status === "fail")) return "fail";
  if (checks.some((check) => check.status === "warn")) return "warn";
  return "pass";
};

const buildSuggestion = (checks: ReportCheck[]) =>
  checks
    .filter((check) => check.status !== "pass")
    .map((check) => `${check.title}: ${check.description.replace(/\.+$/, "")}`);

const calculateScore = (checks: ReportCheck[]) => {
  if (checks.length === 0) return 0;
  return Math.round(
    checks.reduce((total, check) => total + evaluateRecord(check.status), 0) /
      checks.length,
  );
};

const isWorkspaceMx = (host: string) =>
  GOOGLE_MX_RECORDS.has(host.toLowerCase().replace(/\.$/, ""));

const pickMxHosts = (records: string[]) =>
  [...new Set(
    records
      .map((record) => {
        const parts = record.trim().toLowerCase().replace(/\.$/, "").split(/\s+/);
        return parts.length >= 2 ? parts[1] : null;
      })
      .filter((host): host is string => Boolean(host)),
  )].slice(0, MAX_MX_HOSTS);

const hasNullMx = (records: string[]) =>
  records.some((record) => /^0\s+\.$/.test(record.trim()));

const detectMailProvider = (hosts: string[]) => {
  if (hosts.length > 0 && hosts.every(isWorkspaceMx)) return "Google Workspace";
  if (hosts.some(isWorkspaceMx)) return "Mixed routing including Google Workspace";
  if (hosts.some((host) => host.endsWith(".mail.protection.outlook.com"))) {
    return "Microsoft 365";
  }
  if (hosts.some((host) => /(^|\.)mx\d*\.zoho\./.test(host))) return "Zoho Mail";
  if (hosts.some((host) => host.endsWith(".pphosted.com"))) return "Proofpoint";
  if (hosts.some((host) => host.includes("mimecast"))) return "Mimecast";
  if (hosts.some((host) => host.endsWith(".protonmail.ch"))) return "Proton Mail";
  if (hosts.some((host) => host.endsWith(".messagingengine.com"))) return "Fastmail";
  return "Custom mail routing";
};

const validateSelectorLabels = (selector: string) =>
  selector.split(".").every(
    (label) =>
      label.length > 0 &&
      label.length <= 63 &&
      /^[a-z0-9_](?:[a-z0-9_-]{0,61}[a-z0-9_])?$/.test(label),
  );

export function buildDkimQueryName(domain: string, selectorInput: string): string {
  const selectorValue = (selectorInput.trim() || "google")
    .toLowerCase()
    .replace(/\.$/, "");

  if (!selectorValue || selectorValue.length > 253) {
    throw new DiagnosticInputError("Enter a valid DKIM selector.");
  }

  if (selectorValue.includes("._domainkey.")) {
    const markerIndex = selectorValue.indexOf("._domainkey.");
    const signingDomain = selectorValue.slice(
      markerIndex + "._domainkey.".length,
    );
    if (signingDomain !== domain) {
      throw new DiagnosticInputError(
        `The DKIM hostname must belong to ${domain}.`,
      );
    }
    const selector = selectorValue.slice(0, markerIndex);
    if (!validateSelectorLabels(selector)) {
      throw new DiagnosticInputError("Enter a valid DKIM selector.");
    }
    return selectorValue;
  }

  const selector = selectorValue.endsWith("._domainkey")
    ? selectorValue.slice(0, -"._domainkey".length)
    : selectorValue;
  if (selector.includes("._domainkey") || !validateSelectorLabels(selector)) {
    throw new DiagnosticInputError("Enter a valid DKIM selector.");
  }

  return `${selector}._domainkey.${domain}`;
}

type ParsedTagRecord = {
  duplicateTags: string[];
  tags: Map<string, string>;
};

const parseTagRecord = (record: string): ParsedTagRecord => {
  const tags = new Map<string, string>();
  const duplicateTags = new Set<string>();

  for (const part of record.split(";")) {
    const index = part.indexOf("=");
    if (index < 1) continue;
    const key = part.slice(0, index).trim().toLowerCase();
    const value = part.slice(index + 1).trim();
    if (tags.has(key)) duplicateTags.add(key);
    tags.set(key, value);
  }

  return { tags, duplicateTags: [...duplicateTags] };
};

const evaluateSpf = (records: string[], requireGoogle: boolean): ReportCheck => {
  const policies = records
    .map(normalizeTxt)
    .filter((record) => /^v=spf1(?:\s|$)/.test(record));

  if (policies.length === 0) {
    return {
      title: "SPF",
      status: "fail",
      statusText: "Missing",
      description: "No SPF TXT record found at the domain root.",
    };
  }
  if (policies.length > 1) {
    return {
      title: "SPF",
      status: "fail",
      statusText: "Multiple records",
      description: "Multiple SPF policies cause a permanent evaluation error; merge them into one record.",
      details: policies,
    };
  }

  const policy = policies[0];
  const terms = policy.split(/\s+/).filter(Boolean);
  const allIndex = terms.findIndex((term) => /^[+?~-]?all$/i.test(term));
  const allTerm = allIndex >= 0 ? terms[allIndex] : "";
  const redirectTerms = terms.filter((term) =>
    /^redirect=[^\s]+$/i.test(term),
  );
  const redirectTarget = redirectTerms[0]?.slice("redirect=".length) ?? "";
  const qualifier = allTerm
    ? /^[+?~-]/.test(allTerm)
      ? allTerm[0]
      : "+"
    : "";
  const authorizesGoogle = terms.some((term) => {
    const normalized = term.replace(/^[+?~-]/, "");
    return normalized === "include:_spf.google.com" || normalized === "redirect=_spf.google.com";
  });

  let status: ReportStatus = "pass";
  let statusText = "Configured";
  let description = "A single SPF policy with an explicit terminal qualifier was found.";

  if (redirectTerms.length > 1) {
    status = "fail";
    statusText = "Multiple redirects";
    description = "SPF can contain only one redirect modifier.";
  } else if (!allTerm && !redirectTarget) {
    status = "warn";
    statusText = "No final policy";
    description = "SPF has neither an all mechanism nor a redirect modifier for unmatched senders.";
  } else if (!allTerm && redirectTarget) {
    statusText = "Redirected policy";
    description = `SPF delegates its final authorization decision to ${redirectTarget}.`;
  } else if (qualifier === "+") {
    status = "fail";
    statusText = "Unsafe +all";
    description = "SPF authorizes every sender with +all; replace it with an intentional fail policy.";
  } else if (qualifier === "?") {
    status = "warn";
    statusText = "Neutral policy";
    description = "SPF ends with ?all, which provides no clear authorization decision.";
  } else if (
    terms
      .slice(allIndex + 1)
      .some((term) => !/^[a-z][a-z0-9_-]*=/i.test(term))
  ) {
    status = "warn";
    statusText = "Unreachable terms";
    description = "SPF contains mechanisms after all; those terms are never evaluated.";
  } else if (qualifier === "~") {
    statusText = "Soft fail";
    description = "SPF has one policy and ends with the commonly used ~all soft-fail posture.";
  } else if (qualifier === "-") {
    statusText = "Hard fail";
    description = "SPF has one policy and ends with an explicit -all hard-fail posture.";
  }

  if (requireGoogle && !authorizesGoogle && status !== "fail") {
    status = "warn";
    statusText = "Google not authorized";
    description = "SPF exists but does not authorize the Google Workspace sender path.";
  }

  return { title: "SPF", status, statusText, description, details: [policy] };
};

const evaluateDmarc = (
  records: string[],
  strictQuarantine: boolean,
): ReportCheck => {
  const policies = records
    .map(normalizeTxt)
    .filter((record) => /^v=dmarc1(?:;|\s|$)/.test(record));

  if (policies.length === 0) {
    return {
      title: "DMARC",
      status: "warn",
      statusText: "Missing",
      description: "No DMARC policy was found at _dmarc.",
    };
  }
  if (policies.length > 1) {
    return {
      title: "DMARC",
      status: "fail",
      statusText: "Multiple records",
      description: "Multiple DMARC policies prevent reliable evaluation; publish exactly one record.",
      details: policies,
    };
  }

  const policy = policies[0];
  const { tags, duplicateTags } = parseTagRecord(policy);
  const primaryPolicy = tags.get("p");
  const percentageText = tags.get("pct") ?? "100";
  const percentage = Number(percentageText);

  if (duplicateTags.length > 0) {
    return {
      title: "DMARC",
      status: "fail",
      statusText: "Duplicate tags",
      description: `DMARC repeats ${duplicateTags.join(", ")}; each tag must appear only once.`,
      details: [policy],
    };
  }
  if (!primaryPolicy || !["none", "quarantine", "reject"].includes(primaryPolicy)) {
    return {
      title: "DMARC",
      status: "fail",
      statusText: "Invalid policy",
      description: "DMARC must include one valid primary p=none, p=quarantine, or p=reject policy.",
      details: [policy],
    };
  }
  if (!Number.isInteger(percentage) || percentage < 0 || percentage > 100) {
    return {
      title: "DMARC",
      status: "fail",
      statusText: "Invalid percentage",
      description: "DMARC pct must be a whole number from 0 through 100.",
      details: [policy],
    };
  }
  if (primaryPolicy === "none") {
    return {
      title: "DMARC",
      status: "warn",
      statusText: "Report only",
      description: "DMARC is monitoring with p=none and does not request enforcement.",
      details: [policy],
    };
  }
  if (percentage < 100) {
    return {
      title: "DMARC",
      status: "warn",
      statusText: `${percentage}% enforcement`,
      description: `DMARC requests ${primaryPolicy} for only ${percentage}% of failing mail.`,
      details: [policy],
    };
  }
  if (primaryPolicy === "quarantine" && strictQuarantine) {
    return {
      title: "DMARC",
      status: "warn",
      statusText: "Quarantine",
      description: "DMARC quarantines failing mail; move to reject only after validating legitimate senders.",
      details: [policy],
    };
  }

  return {
    title: "DMARC",
    status: "pass",
    statusText: primaryPolicy === "reject" ? "Reject" : "Quarantine",
    description: `DMARC applies p=${primaryPolicy} to all failing mail.`,
    details: [policy],
  };
};

const evaluateDkim = (
  records: string[],
  displayName: string,
  missingStatus: ReportStatus,
): ReportCheck => {
  const policies = records.map(normalizeTxt).filter((record) => {
    const { tags } = parseTagRecord(record);
    const version = tags.get("v");
    return version === "dkim1" || (!version && tags.has("p"));
  });
  const title = displayName === "google._domainkey" ? "DKIM (Google selector)" : "DKIM selector";

  if (policies.length === 0) {
    return {
      title,
      status: missingStatus,
      statusText: "Missing",
      description: `No usable DKIM record was found at ${displayName}.`,
    };
  }
  if (policies.length > 1) {
    return {
      title,
      status: "fail",
      statusText: "Multiple records",
      description: `Multiple DKIM policies were returned at ${displayName}.`,
      details: policies,
    };
  }

  const policy = policies[0];
  const { tags, duplicateTags } = parseTagRecord(policy);
  if (duplicateTags.length > 0) {
    return {
      title,
      status: "fail",
      statusText: "Duplicate tags",
      description: "The DKIM policy repeats one or more tags.",
      details: [policy],
    };
  }
  if (!tags.has("p")) {
    return {
      title,
      status: "warn",
      statusText: "Incomplete",
      description: `DKIM exists at ${displayName} but does not publish a public key.`,
      details: [policy],
    };
  }
  if (!tags.get("p")) {
    return {
      title,
      status: "fail",
      statusText: "Revoked key",
      description: `DKIM at ${displayName} has an empty p= value, which marks the key as revoked.`,
      details: [policy],
    };
  }

  return {
    title,
    status: "pass",
    statusText: "Pass",
    description: `A published DKIM public key was found at ${displayName}.`,
    details: [policy],
  };
};

export const runWorkspaceDiagnostic = async (
  domainInput: string,
  selectorInput: string,
): Promise<DomainDiagnostic> => {
  const domain = normalizeDomainInput(domainInput);
  const dkimQueryName = buildDkimQueryName(domain, selectorInput);
  const dkimDisplayName = dkimQueryName.slice(0, -`.${domain}`.length);

  const [mxRecords, txtRecords, dkimRecords, dmarcRecords] = await Promise.all([
    fetchDnsRecords(domain, "MX"),
    fetchDnsRecords(domain, "TXT"),
    fetchDnsRecords(dkimQueryName, "TXT"),
    fetchDnsRecords(`_dmarc.${domain}`, "TXT"),
  ]);

  const checks: ReportCheck[] = [];
  const verificationRecords = txtRecords
    .map(normalizeTxt)
    .filter((record) => record.startsWith("google-site-verification="));
  checks.push(
    verificationRecords.length > 0
      ? {
          title: "Google site verification TXT",
          status: "pass",
          statusText: "Pass",
          description: "A Google site-verification TXT record was found.",
        }
      : {
          title: "Google site verification TXT",
          status: "warn",
          statusText: "Not found",
          description: "No Google site-verification TXT record was found at the domain root.",
        },
  );

  if (mxRecords.length === 0) {
    checks.push({
      title: "Workspace MX records",
      status: "fail",
      statusText: "Missing",
      description: "No MX records were found for the domain.",
    });
  } else if (hasNullMx(mxRecords)) {
    checks.push({
      title: "Workspace MX records",
      status: "fail",
      statusText: "Null MX",
      description: "The domain publishes a null MX record and explicitly does not accept email.",
    });
  } else {
    const hosts = pickMxHosts(mxRecords);
    if (hosts.length === 0) {
      checks.push({
        title: "Workspace MX records",
        status: "warn",
        statusText: "Parse issue",
        description: "MX answers were returned but their hostnames could not be parsed.",
      });
    } else if (hosts.every(isWorkspaceMx)) {
      checks.push({
        title: "Workspace MX records",
        status: "pass",
        statusText: "Pass",
        description: "All configured MX records match current or supported legacy Google Workspace targets.",
        details: hosts,
      });
    } else if (hosts.some(isWorkspaceMx)) {
      checks.push({
        title: "Workspace MX records",
        status: "warn",
        statusText: "Mixed routing",
        description: "MX records mix Google Workspace with other routing endpoints; confirm this is intentional.",
        details: hosts,
      });
    } else {
      checks.push({
        title: "Workspace MX records",
        status: "warn",
        statusText: "Custom routing",
        description: "MX records do not point directly to Google Workspace; verify any gateway or migration path.",
        details: hosts,
      });
    }
  }

  checks.push(evaluateSpf(txtRecords, true));
  checks.push(evaluateDkim(dkimRecords, dkimDisplayName, "fail"));
  checks.push(evaluateDmarc(dmarcRecords, false));

  const severity = rankStatus(checks);
  return {
    domain,
    checks,
    score: calculateScore(checks),
    summary:
      severity === "pass"
        ? "The visible Workspace DNS baseline is healthy."
        : severity === "warn"
          ? "The Workspace DNS baseline is mostly ready; review warning items before cutover."
          : "The Workspace DNS baseline has failures that should be corrected before production use.",
    suggestions: buildSuggestion(checks),
  };
};

export const runDeliverabilityDiagnostic = async (
  domainInput: string,
): Promise<DomainDiagnostic> => {
  const domain = normalizeDomainInput(domainInput);
  const [mxRecords, txtRecords, dmarcRecords] = await Promise.all([
    fetchDnsRecords(domain, "MX"),
    fetchDnsRecords(domain, "TXT"),
    fetchDnsRecords(`_dmarc.${domain}`, "TXT"),
  ]);

  const checks: ReportCheck[] = [];
  let workspaceDetected = false;

  if (mxRecords.length === 0) {
    checks.push({
      title: "Inbound MX",
      status: "fail",
      statusText: "Missing",
      description: "No MX records were found, so inbound mail has no published destination.",
    });
  } else if (hasNullMx(mxRecords)) {
    checks.push({
      title: "Inbound MX",
      status: "fail",
      statusText: "Null MX",
      description: "The domain explicitly publishes that it does not accept inbound email.",
    });
  } else {
    const hosts = pickMxHosts(mxRecords);
    if (hosts.length === 0) {
      checks.push({
        title: "Inbound MX",
        status: "warn",
        statusText: "Parse issue",
        description: "MX answers were returned but their hostnames could not be parsed.",
      });
    } else {
      const provider = detectMailProvider(hosts);
      workspaceDetected = hosts.some(isWorkspaceMx);
      const resolution = await Promise.all(
        hosts.map(async (host) => {
          const [ipv4, ipv6] = await Promise.all([
            fetchDnsRecords(host, "A"),
            fetchDnsRecords(host, "AAAA"),
          ]);
          return ipv4.length > 0 || ipv6.length > 0;
        }),
      );
      const allResolvable = resolution.every(Boolean);
      checks.push({
        title: "Inbound MX",
        status: allResolvable ? "pass" : "warn",
        statusText: allResolvable ? "Pass" : "Partial",
        description: allResolvable
          ? `Found ${hosts.length} resolvable MX target(s). Detected routing: ${provider}.`
          : `One or more MX targets did not resolve to A or AAAA records. Detected routing: ${provider}.`,
        details: hosts,
      });
    }
  }

  checks.push(evaluateSpf(txtRecords, false));
  checks.push(evaluateDmarc(dmarcRecords, true));

  if (workspaceDetected) {
    const googleDkimRecords = await fetchDnsRecords(
      `google._domainkey.${domain}`,
      "TXT",
    );
    checks.push(
      evaluateDkim(googleDkimRecords, "google._domainkey", "warn"),
    );
  }

  const severity = rankStatus(checks);
  return {
    domain,
    checks,
    score: calculateScore(checks),
    summary:
      severity === "pass"
        ? "The visible mail DNS baseline is healthy."
        : severity === "warn"
          ? "The mail DNS baseline is usable but has items that should be reviewed."
          : "The mail DNS baseline has failures that can affect reliable delivery.",
    suggestions: buildSuggestion(checks),
  };
};
