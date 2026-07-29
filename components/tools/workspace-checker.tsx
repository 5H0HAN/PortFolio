"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { DomainDiagnostic } from "@/lib/tool-checks";
import ToolReport from "@/components/tools/tool-report";

type ToolApiResponse = Partial<DomainDiagnostic> & {
  error?: string;
};

const normalizePreviewDomain = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");

export default function WorkspaceChecker() {
  const [domain, setDomain] = useState("");
  const [selector, setSelector] = useState("google._domainkey");
  const [report, setReport] = useState<DomainDiagnostic | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookupPreview = useMemo(() => {
    const cleanDomain = normalizePreviewDomain(domain) || "example.com";
    const cleanSelector = selector.trim().toLowerCase().replace(/\.$/, "") || "google._domainkey";
    const selectorName = cleanSelector.includes("._domainkey")
      ? cleanSelector
      : `${cleanSelector}._domainkey`;

    return selectorName.endsWith(`.${cleanDomain}`)
      ? selectorName
      : `${selectorName}.${cleanDomain}`;
  }, [domain, selector]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!domain.trim()) {
      setError("Enter the domain you want to check.");
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);

    try {
      const response = await fetch("/api/tools/workspace-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, dkimSelector: selector }),
      });
      const payload = (await response.json()) as ToolApiResponse;

      if (
        !response.ok ||
        payload.error ||
        !payload.domain ||
        typeof payload.score !== "number" ||
        !payload.summary ||
        !payload.suggestions ||
        !payload.checks
      ) {
        throw new Error(payload.error ?? "The DNS report could not be generated.");
      }

      setReport({
        domain: payload.domain,
        score: payload.score,
        summary: payload.summary,
        suggestions: payload.suggestions,
        checks: payload.checks,
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The lookup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="tool-workbench-grid">
        <section className="tool-runner-card" aria-labelledby="workspace-runner-title">
          <div className="tool-runner-heading">
            <div>
              <p className="tool-overline">Run diagnostic</p>
              <h2 id="workspace-runner-title">Workspace DNS check</h2>
            </div>
            <span>Read-only</span>
          </div>

          <form className="tool-runner-form" onSubmit={onSubmit} noValidate>
            <div className="tool-field">
              <label htmlFor="workspace-domain">Domain</label>
              <input
                id="workspace-domain"
                name="domain"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                type="text"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="example.com"
                aria-describedby="workspace-domain-help"
                required
              />
              <p id="workspace-domain-help">Enter the bare domain, without https:// or a mailbox.</p>
            </div>

            <div className="tool-field">
              <label htmlFor="workspace-selector">
                DKIM selector
                <span>Optional</span>
              </label>
              <input
                id="workspace-selector"
                name="dkimSelector"
                value={selector}
                onChange={(event) => setSelector(event.target.value)}
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="google._domainkey"
                aria-describedby="workspace-selector-help"
              />
              <p id="workspace-selector-help">
                Keep the Google default or enter a custom selector such as <code>mail</code>.
              </p>
            </div>

            <div className="tool-dns-preview">
              <span>DKIM lookup</span>
              <code>{lookupPreview}</code>
            </div>

            {error ? (
              <p className="tool-inline-error" role="alert">
                {error}
              </p>
            ) : null}

            <button className="btn tool-submit" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="tool-spinner" aria-hidden="true" />
                  Checking public DNS
                </>
              ) : (
                "Check Workspace DNS"
              )}
            </button>
          </form>
        </section>

        <aside className="tool-guide-card" aria-labelledby="workspace-guide-title">
          <div className="tool-guide-heading">
            <p className="tool-overline">How to use it</p>
            <h2 id="workspace-guide-title">Before your rollout</h2>
          </div>
          <ol className="tool-step-list">
            <li>
              <span>1</span>
              <div>
                <strong>Use the primary domain</strong>
                <p>Check the domain connected to your Workspace tenant.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>Confirm the selector</strong>
                <p>Google normally uses google._domainkey; custom setups may differ.</p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>Resolve failures first</strong>
                <p>Re-run the checker after your DNS provider publishes changes.</p>
              </div>
            </li>
          </ol>
          <p className="tool-privacy-note">
            This tool queries public DNS. It does not connect to your Admin console.
          </p>
        </aside>
      </div>

      {report ? (
        <ToolReport
          report={report}
          clearMessage="The public DNS baseline looks healthy. Confirm activation, routing, and user settings inside the Google Admin console before cutover."
        />
      ) : null}
    </>
  );
}
