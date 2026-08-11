import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildDkimQueryName,
  DiagnosticInputError,
  normalizeDomainInput,
  runDeliverabilityDiagnostic,
  runWorkspaceDiagnostic,
} from "@/lib/tool-checks";

const DNS_TYPES: Record<string, number> = {
  A: 1,
  MX: 15,
  TXT: 16,
  AAAA: 28,
};

function mockDns(records: Record<string, string[]>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      const name = url.searchParams.get("name") || "";
      const type = url.searchParams.get("type") || "";
      const answers = records[`${type}:${name}`] || [];
      return new Response(
        JSON.stringify({
          Status: 0,
          Answer: answers.map((data) => ({
            data,
            name,
            type: DNS_TYPES[type],
          })),
        }),
        { status: 200 },
      );
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("domain and selector validation", () => {
  it("normalizes HTTPS and internationalized domain inputs", () => {
    expect(normalizeDomainInput("https://BÜCHER.example/path")).toBe(
      "xn--bcher-kva.example",
    );
  });

  it.each(["", "localhost", "127.0.0.1", "user@example.com", "bad_domain.com"])(
    "rejects invalid public domain input %s",
    (value) => {
      expect(() => normalizeDomainInput(value)).toThrow(DiagnosticInputError);
    },
  );

  it("accepts simple and same-domain DKIM selectors", () => {
    expect(buildDkimQueryName("example.com", "mail")).toBe(
      "mail._domainkey.example.com",
    );
    expect(
      buildDkimQueryName("example.com", "google._domainkey.example.com"),
    ).toBe("google._domainkey.example.com");
  });

  it("rejects a DKIM hostname belonging to another domain", () => {
    expect(() =>
      buildDkimQueryName("example.com", "mail._domainkey.other.example"),
    ).toThrow(DiagnosticInputError);
  });

  it("rejects a DKIM hostname for a subdomain of the tested domain", () => {
    expect(() =>
      buildDkimQueryName(
        "example.com",
        "mail._domainkey.department.example.com",
      ),
    ).toThrow(DiagnosticInputError);
  });
});

describe("Workspace diagnostic", () => {
  it("recognizes Google's current smtp.google.com MX target", async () => {
    const domain = "current-google.example";
    mockDns({
      [`MX:${domain}`]: ["1 smtp.google.com."],
      [`TXT:${domain}`]: [
        '"google-site-verification=verified"',
        '"v=spf1 include:_spf.google.com ~all"',
      ],
      [`TXT:google._domainkey.${domain}`]: ['"v=DKIM1; k=rsa; p=abc123"'],
      [`TXT:_dmarc.${domain}`]: ['"v=DMARC1; p=quarantine"'],
    });

    const report = await runWorkspaceDiagnostic(domain, "google");
    const mx = report.checks.find((check) => check.title === "Workspace MX records");

    expect(mx).toMatchObject({ status: "pass", statusText: "Pass" });
    expect(report.score).toBe(100);
  });

  it("does not confuse the DMARC sp policy with the primary p policy", async () => {
    const domain = "dmarc-subdomain-policy.example";
    mockDns({
      [`MX:${domain}`]: ["1 smtp.google.com."],
      [`TXT:${domain}`]: ['"v=spf1 include:_spf.google.com ~all"'],
      [`TXT:google._domainkey.${domain}`]: ['"v=DKIM1; p=abc123"'],
      [`TXT:_dmarc.${domain}`]: ['"v=DMARC1; p=none; sp=reject"'],
    });

    const report = await runWorkspaceDiagnostic(domain, "google");
    expect(report.checks.find((check) => check.title === "DMARC")).toMatchObject({
      status: "warn",
      statusText: "Report only",
    });
  });

  it("fails multiple SPF records and an explicitly revoked DKIM key", async () => {
    const domain = "invalid-auth.example";
    mockDns({
      [`MX:${domain}`]: ["1 smtp.google.com."],
      [`TXT:${domain}`]: [
        '"v=spf1 include:_spf.google.com ~all"',
        '"v=spf1 -all"',
      ],
      [`TXT:google._domainkey.${domain}`]: ['"v=DKIM1; p="'],
      [`TXT:_dmarc.${domain}`]: ['"v=DMARC1; p=reject"'],
    });

    const report = await runWorkspaceDiagnostic(domain, "google");
    expect(report.checks.find((check) => check.title === "SPF")).toMatchObject({
      status: "fail",
      statusText: "Multiple records",
    });
    expect(report.checks.find((check) => check.title === "DKIM (Google selector)")).toMatchObject({
      status: "fail",
      statusText: "Revoked key",
    });
  });

  it("accepts redirect-only SPF and a DKIM key without a version tag", async () => {
    const domain = "valid-alternatives.example";
    mockDns({
      [`MX:${domain}`]: ["1 smtp.google.com."],
      [`TXT:${domain}`]: ['"v=spf1 redirect=_spf.google.com"'],
      [`TXT:google._domainkey.${domain}`]: ['"k=rsa; p=abc123"'],
      [`TXT:_dmarc.${domain}`]: ['"v=DMARC1; p=reject"'],
    });

    const report = await runWorkspaceDiagnostic(domain, "google");
    expect(report.checks.find((check) => check.title === "SPF")).toMatchObject({
      status: "pass",
      statusText: "Redirected policy",
    });
    expect(report.checks.find((check) => check.title.includes("DKIM"))).toMatchObject({
      status: "pass",
    });
  });
});

describe("general deliverability diagnostic", () => {
  it("accepts valid non-Google routing without applying Google-only penalties", async () => {
    const domain = "microsoft-mail.example";
    const mxHost = "tenant.mail.protection.outlook.com";
    mockDns({
      [`MX:${domain}`]: [`0 ${mxHost}.`],
      [`TXT:${domain}`]: ['"v=spf1 -all"'],
      [`TXT:_dmarc.${domain}`]: ['"v=DMARC1; p=reject"'],
      [`A:${mxHost}`]: ["192.0.2.10"],
    });

    const report = await runDeliverabilityDiagnostic(domain);

    expect(report.checks).toHaveLength(3);
    expect(report.checks[0]).toMatchObject({ status: "pass" });
    expect(report.checks[0].description).toContain("Microsoft 365");
    expect(report.checks.some((check) => check.statusText === "Non-Workspace")).toBe(false);
    expect(report.checks.some((check) => check.title.includes("DKIM"))).toBe(false);
    expect(report.score).toBe(100);
  });

  it("fails a null MX instead of reporting a parsing warning", async () => {
    const domain = "no-inbound-mail.example";
    mockDns({
      [`MX:${domain}`]: ["0 ."],
      [`TXT:${domain}`]: ['"v=spf1 -all"'],
      [`TXT:_dmarc.${domain}`]: ['"v=DMARC1; p=reject"'],
    });

    const report = await runDeliverabilityDiagnostic(domain);
    expect(report.checks[0]).toMatchObject({
      status: "fail",
      statusText: "Null MX",
    });
  });

  it("rejects resolver failures instead of treating them as missing DNS", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ Status: 2 }), { status: 200 }),
      ),
    );

    await expect(
      runDeliverabilityDiagnostic("resolver-failure.example"),
    ).rejects.toThrow("DNS resolver returned status 2");
  });
});
