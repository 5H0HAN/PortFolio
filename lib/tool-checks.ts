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

type DnsAnswer = {
  data: string;
  name: string;
  type: number;
};

type DnsJsonResponse = {
  Status?: number;
  Answer?: DnsAnswer[];
};

const GOOGLE_MX_RECORDS = new Set([
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

const normalizeDomain = (raw: string) =>
  raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//g, "")
    .replace(/\/.*$/g, "")
    .replace(/\.$/g, "");

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

const fetchDnsRecords = async (name: string, type: "TXT" | "MX" | "A" | "AAAA"): Promise<string[]> => {
  const url = new URL("https://dns.google/resolve");
  url.searchParams.set("name", name);
  url.searchParams.set("type", type);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`DNS lookup failed for ${name} (${type})`);
  }

  const data = (await response.json()) as DnsJsonResponse;
  if (!data.Answer || data.Answer.length === 0) {
    return [];
  }

  return data.Answer.map((answer) => answer.data);
};

const evaluateRecord = (status: ReportStatus): number => {
  if (status === "pass") {
    return 100;
  }
  if (status === "warn") {
    return 50;
  }
  return 0;
};

const rankStatus = (checks: ReportCheck[]): ReportStatus => {
  if (checks.some((check) => check.status === "fail")) {
    return "fail";
  }
  if (checks.some((check) => check.status === "warn")) {
    return "warn";
  }
  return "pass";
};

const buildSuggestion = (checks: ReportCheck[]) => {
  return checks
    .filter((check) => check.status !== "pass")
    .map((check) => `${check.title}: ${check.description}`)
    .map((item) => item.replace(/\.+$/, ""));
};

const isWorkspaceMx = (host: string) => GOOGLE_MX_RECORDS.has(host.toLowerCase().replace(/\.$/g, ""));

const pickMxHosts = (records: string[]) => {
  return records
    .map((record) => {
      const entry = record.trim().toLowerCase().replace(/\.$/g, "");
      const parts = entry.split(/\s+/);
      if (parts.length < 2) {
        return null;
      }
      const host = parts[1];
      const priority = Number.parseInt(parts[0], 10);
      return Number.isNaN(priority) ? { host } : { host, priority };
    })
    .filter((item): item is { host: string; priority?: number } => item !== null)
    .map((item) => item.host);
};

const buildDkimQueryName = (domain: string, selectorInput: string) => {
  const normalizedSelector = selectorInput.trim().toLowerCase().replace(/\.$/g, "");
  const cleanedDomain = normalizeDomain(domain);
  const withDomain = cleanedDomain ? `.${cleanedDomain}` : "";

  if (!normalizedSelector) {
    return `google._domainkey${withDomain}`;
  }

  if (normalizedSelector.includes("._domainkey")) {
    if (normalizedSelector.endsWith(withDomain)) {
      return normalizedSelector;
    }
    return `${normalizedSelector}${withDomain}`;
  }

  return `${normalizedSelector}._domainkey${withDomain}`;
};

export const runWorkspaceDiagnostic = async (
  domainInput: string,
  selectorInput: string
): Promise<DomainDiagnostic> => {
  const domain = normalizeDomain(domainInput);
  const selector = selectorInput.trim() ? selectorInput.trim() : "google";
  const checks: ReportCheck[] = [];

  const mxRecords = await fetchDnsRecords(domain, "MX");
  const txtRecords = await fetchDnsRecords(domain, "TXT");
  const dkimQueryName = buildDkimQueryName(domain, selector);
  const dkimDisplayName = dkimQueryName.replace(`.${domain}`, "");
  const dkimRecords = await fetchDnsRecords(dkimQueryName, "TXT");
  const dmarcRecords = await fetchDnsRecords(`_dmarc.${domain}`, "TXT");

  const verificationRecords = txtRecords
    .map(normalizeTxt)
    .filter((record) => record.includes("google-site-verification"));
  if (verificationRecords.length > 0) {
    checks.push({
      title: "Google site verification TXT",
      status: "pass",
      statusText: "Pass",
      description: "Google site verification TXT record was found.",
    });
  } else {
    checks.push({
      title: "Google site verification TXT",
      status: "warn",
      statusText: "Not found",
      description:
        "Add a verification TXT record from Workspace Admin before DNS cutover or migration start.",
    });
  }

  if (mxRecords.length === 0) {
    checks.push({
      title: "Workspace MX records",
      status: "fail",
      statusText: "Missing",
      description: "No MX records found for the domain.",
      details: ["Add Workspace MX entries in your DNS provider."],
    });
  } else {
    const hosts = pickMxHosts(mxRecords);
    if (hosts.length === 0) {
      checks.push({
        title: "Workspace MX records",
        status: "warn",
        statusText: "Parse issue",
        description: "MX records returned but could not parse host entries.",
      });
    } else {
      const allGoogle = hosts.length > 0 && hosts.every(isWorkspaceMx);
      const anyGoogle = hosts.some(isWorkspaceMx);

      if (allGoogle) {
        checks.push({
          title: "Workspace MX records",
          status: "pass",
          statusText: "Pass",
          description: "All configured MX records match Workspace mail targets.",
        });
      } else if (anyGoogle) {
        checks.push({
          title: "Workspace MX records",
          status: "warn",
          statusText: "Mixed",
          description:
            "MX entries include Google Workspace hosts but also other routing endpoints.",
          details: hosts,
        });
      } else {
        checks.push({
          title: "Workspace MX records",
          status: "warn",
          statusText: "Custom routing",
          description:
            "Current MX records do not match Google Workspace defaults. Verify migration target intentionally.",
          details: hosts,
        });
      }
    }
  }

  const normalizedTxt = txtRecords.map(normalizeTxt);
  const spfRecord = normalizedTxt.find((entry) => entry.startsWith("v=spf1"));
  if (!spfRecord) {
    checks.push({
      title: "SPF",
      status: "fail",
      statusText: "Missing",
      description: "No SPF TXT record found at domain root.",
    });
  } else if (spfRecord.includes("include:_spf.google.com")) {
    checks.push({
      title: "SPF",
      status: "pass",
      statusText: "Pass",
      description: "SPF record found and includes Google Workspace sender path.",
      details: [spfRecord],
    });
  } else {
    checks.push({
      title: "SPF",
      status: "warn",
      statusText: "Present",
      description:
        "SPF exists but does not explicitly include Google Workspace baseline include.",
      details: [spfRecord],
    });
  }

  const dkimNormalized = dkimRecords.map(normalizeTxt);
  const dkimMatch = dkimNormalized.find((entry) => entry.includes("v=dkim1") && entry.includes("p="));
  if (dkimMatch) {
    checks.push({
      title: "DKIM selector",
      status: "pass",
      statusText: "Pass",
      description: `DKIM found at ${dkimDisplayName}.`,
      details: [dkimMatch],
    });
  } else if (dkimRecords.length > 0) {
    checks.push({
      title: "DKIM selector",
      status: "warn",
      statusText: "Found incomplete",
      description: `DKIM TXT exists at ${dkimDisplayName} but may be incomplete.`,
      details: dkimNormalized,
    });
  } else {
    checks.push({
      title: "DKIM selector",
      status: "fail",
      statusText: "Missing",
      description: `No DKIM record found for selector ${dkimDisplayName}.`,
      details: [`Use ${dkimQueryName} lookup`],
    });
  }

  const dmarcNormalized = dmarcRecords.map(normalizeTxt);
  const dmarcRecord = dmarcNormalized.find((entry) => entry.includes("v=dmarc1"));
  if (!dmarcRecord) {
    checks.push({
      title: "DMARC",
      status: "warn",
      statusText: "Missing",
      description: "No DMARC TXT at _dmarc.",
      details: ["Add _dmarc TXT record with at least p=none before launch."],
    });
  } else if (dmarcRecord.includes("p=reject") || dmarcRecord.includes("p=quarantine")) {
    checks.push({
      title: "DMARC",
      status: "pass",
      statusText: "Pass",
      description: "DMARC policy found with enforcement or quarantine posture.",
      details: [dmarcRecord],
    });
  } else {
    checks.push({
      title: "DMARC",
      status: "warn",
      statusText: "Basic",
      description: "DMARC exists but policy is permissive (p=none).",
      details: [dmarcRecord],
    });
  }

  const score =
    checks.reduce((total, check) => total + evaluateRecord(check.status), 0) / checks.length;
  const severity = rankStatus(checks);
  const suggestions = buildSuggestion(checks);

  return {
    domain,
    checks,
    score: Math.round(score),
    summary:
      severity === "pass"
        ? "Workspace baseline is healthy and ready for migration checks."
        : severity === "warn"
          ? "Workspace setup is mostly ready; address warning items before production cutover."
          : "Workspace setup requires fixes before reliable production use.",
    suggestions,
  };
};

export const runDeliverabilityDiagnostic = async (domainInput: string): Promise<DomainDiagnostic> => {
  const domain = normalizeDomain(domainInput);
  const checks: ReportCheck[] = [];

  const mxRecords = await fetchDnsRecords(domain, "MX");
  const txtRecords = await fetchDnsRecords(domain, "TXT");
  const dmarcRecords = await fetchDnsRecords(`_dmarc.${domain}`, "TXT");
  const dkimDefaultRecords = await fetchDnsRecords(`google._domainkey.${domain}`, "TXT");

  if (mxRecords.length === 0) {
    checks.push({
      title: "Inbound MX",
      status: "fail",
      statusText: "Missing",
      description: "No MX records. Mail cannot be routed to destination servers.",
    });
  } else {
    const hosts = pickMxHosts(mxRecords);
    if (hosts.length === 0) {
      checks.push({
        title: "Inbound MX",
        status: "warn",
        statusText: "Parse issue",
        description: "MX records returned but host values could not be parsed for checks.",
      });
    } else {
      const resolvableMx = await Promise.all(hosts.map((host) => fetchDnsRecords(host, "A")));
      const allResolvable = resolvableMx.every((records) => records.length > 0);
      const workspaceCoverage = hosts.filter((host) => isWorkspaceMx(host));

      if (allResolvable) {
        checks.push({
          title: "Inbound MX",
          status: "pass",
          statusText: "Pass",
          description: `Found ${hosts.length} MX records; all hosts resolve to A records.`,
        });
      } else {
        checks.push({
          title: "Inbound MX",
          status: "warn",
          statusText: "Partial",
          description: "One or more MX hosts do not have resolvable A records.",
          details: hosts,
        });
      }

      if (workspaceCoverage.length > 0) {
        checks.push({
          title: "Workspace routing profile",
          status: "pass",
          statusText: "Detected",
          description: `MX points to ${workspaceCoverage.length} Workspace endpoint(s).`,
          details: hosts,
        });
      } else {
        checks.push({
          title: "Workspace routing profile",
          status: "warn",
          statusText: "Non-Workspace",
          description:
            "MX endpoints do not match default Workspace hosts. Confirm intentional routing path.",
          details: hosts,
        });
      }
    }
  }

  const normalizedTxt = txtRecords.map(normalizeTxt);
  const spf = normalizedTxt.find((entry) => entry.startsWith("v=spf1"));
  if (!spf) {
    checks.push({
      title: "SPF",
      status: "fail",
      statusText: "Missing",
      description: "No SPF TXT record found at domain root.",
    });
  } else {
    checks.push({
      title: "SPF",
      status: spf.includes("include:") ? "pass" : "warn",
      statusText: spf.includes("include:") ? "Configured" : "Weak",
      description:
        spf.includes("~all") || spf.includes("-all")
          ? "SPF has explicit fail policy for non-authorized senders."
          : "SPF exists but lacks a strict mechanism.",
      details: [spf],
    });
  }

  const dmarc = dmarcRecords.map(normalizeTxt).find((entry) => entry.includes("v=dmarc1"));
  if (!dmarc) {
    checks.push({
      title: "DMARC",
      status: "warn",
      statusText: "Missing",
      description: "No DMARC record. This weakens mailbox-level reporting and enforcement.",
    });
  } else if (dmarc.includes("p=reject")) {
    checks.push({
      title: "DMARC",
      status: "pass",
      statusText: "Strict",
      description: "DMARC is set to reject for failing messages.",
      details: [dmarc],
    });
  } else if (dmarc.includes("p=quarantine")) {
    checks.push({
      title: "DMARC",
      status: "warn",
      statusText: "Quarantine",
      description: "DMARC currently quarantines suspicious mail; consider reject after validation.",
      details: [dmarc],
    });
  } else {
    checks.push({
      title: "DMARC",
      status: "warn",
      statusText: "Report-only",
      description: "DMARC is present but with soft enforcement posture.",
      details: [dmarc],
    });
  }

  if (dkimDefaultRecords.length === 0) {
    checks.push({
      title: "DKIM (default)",
      status: "warn",
      statusText: "Missing",
      description: "Default Google selector google._domainkey lookup did not return a usable record.",
    });
  } else {
    const normalizedDkim = dkimDefaultRecords.map(normalizeTxt);
    const foundDkim = normalizedDkim.find((record) => record.includes("v=dkim1") && record.includes("p="));
    if (foundDkim) {
      checks.push({
        title: "DKIM (default)",
        status: "pass",
        statusText: "Pass",
        description: "Default Google DKIM selector is present.",
        details: [foundDkim],
      });
    } else {
      checks.push({
        title: "DKIM (default)",
        status: "warn",
        statusText: "Incomplete",
        description: "DKIM lookup returned data but record format may be incomplete.",
      });
    }
  }

  const score =
    checks.reduce((total, check) => total + evaluateRecord(check.status), 0) / checks.length;
  const severity = rankStatus(checks);
  const suggestions = buildSuggestion(checks);

  const summary =
    severity === "pass"
      ? "Mail deliverability baseline is healthy."
      : severity === "warn"
        ? "Delivery posture is acceptable but should be tightened before large-volume sending."
        : "Mail delivery risks are present and should be fixed before rollout.";

  return {
    domain,
    checks,
    score: Math.round(score),
    summary,
    suggestions,
  };
};
