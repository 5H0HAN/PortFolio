"use client";

import { useState, type FormEvent } from "react";
import type { DomainDiagnostic } from "@/lib/tool-checks";
import ToolReport from "@/components/tools/tool-report";

type ToolApiResponse = Partial<DomainDiagnostic> & {
  error?: string;
};

export default function DeliverabilityChecker() {
  const [domain, setDomain] = useState("");
  const [report, setReport] = useState<DomainDiagnostic | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!domain.trim()) {
      setError("Enter the sending domain you want to assess.");
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);

    try {
      const response = await fetch("/api/tools/deliverability-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
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
        throw new Error(payload.error ?? "The deliverability report could not be generated.");
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
        <section className="tool-runner-card" aria-labelledby="deliverability-runner-title">
          <div className="tool-runner-heading">
            <div>
              <p className="tool-overline">Run assessment</p>
              <h2 id="deliverability-runner-title">Mail DNS readiness</h2>
            </div>
            <span>No email sent</span>
          </div>

          <form className="tool-runner-form" onSubmit={onSubmit} noValidate>
            <div className="tool-field">
              <label htmlFor="deliverability-domain">Sending domain</label>
              <input
                id="deliverability-domain"
                name="domain"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                type="text"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="example.com"
                aria-describedby="deliverability-domain-help"
                required
              />
              <p id="deliverability-domain-help">
                Use the domain shown after @ in your outgoing email address.
              </p>
            </div>

            <div className="tool-expectation-note">
              <strong>What the score means</strong>
              <p>It measures public DNS readiness, not guaranteed inbox placement.</p>
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
                  Assessing mail DNS
                </>
              ) : (
                "Run deliverability test"
              )}
            </button>
          </form>
        </section>

        <aside className="tool-guide-card" aria-labelledby="deliverability-guide-title">
          <div className="tool-guide-heading">
            <p className="tool-overline">Use the result well</p>
            <h2 id="deliverability-guide-title">A baseline, not a guarantee</h2>
          </div>
          <ol className="tool-step-list">
            <li>
              <span>1</span>
              <div>
                <strong>Check the real sender domain</strong>
                <p>Use the same domain your recipients will see.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>Review authentication</strong>
                <p>SPF, DKIM, and DMARC should align with every sending service.</p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>Follow with live testing</strong>
                <p>Send representative messages to real providers and monitor outcomes.</p>
              </div>
            </li>
          </ol>
          <p className="tool-privacy-note">
            The checker reads public records only and does not contact a mailbox.
          </p>
        </aside>
      </div>

      {report ? (
        <ToolReport
          report={report}
          clearMessage="The DNS foundation looks healthy. Continue with reputation, message-content, and real inbox-placement testing before increasing volume."
        />
      ) : null}
    </>
  );
}
