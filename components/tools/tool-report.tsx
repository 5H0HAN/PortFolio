import type { CSSProperties } from "react";
import type { DomainDiagnostic, ReportStatus } from "@/lib/tool-checks";

type ToolReportProps = {
  report: DomainDiagnostic;
  clearMessage: string;
};

const statusClass = (status: ReportStatus) => `tool-status-${status}`;

const scoreLabel = (score: number) => {
  if (score >= 90) return "Strong baseline";
  if (score >= 75) return "Mostly ready";
  if (score >= 50) return "Needs improvement";
  return "Action required";
};

export default function ToolReport({ report, clearMessage }: ToolReportProps) {
  const scoreStyle = {
    "--tool-score": `${Math.max(0, Math.min(100, report.score)) * 3.6}deg`,
  } as CSSProperties;

  return (
    <section className="tool-results" aria-labelledby="tool-report-heading" aria-live="polite">
      <div className="tool-results-summary">
        <div className="tool-score-dial" style={scoreStyle} aria-label={`Score ${report.score} out of 100`}>
          <div>
            <strong>{report.score}</strong>
            <span>/100</span>
          </div>
        </div>
        <div className="tool-results-copy">
          <p className="tool-overline">Diagnostic complete</p>
          <h2 id="tool-report-heading">Report for {report.domain}</h2>
          <p>{report.summary}</p>
          <span className="tool-score-label">{scoreLabel(report.score)}</span>
        </div>
      </div>

      <div className="tool-results-body">
        <div className="tool-results-heading">
          <div>
            <p className="tool-overline">Checks</p>
            <h3>DNS findings</h3>
          </div>
          <span>{report.checks.length} records reviewed</span>
        </div>

        <ul className="tool-check-list">
          {report.checks.map((check) => (
            <li className="tool-check-item" key={`${check.title}-${check.statusText}`}>
              <div className="tool-check-heading">
                <div>
                  <span className={`tool-status-dot ${statusClass(check.status)}`} aria-hidden="true" />
                  <p className="tool-check-title">{check.title}</p>
                </div>
                <span className={`tool-check-badge ${statusClass(check.status)}`}>
                  {check.statusText}
                </span>
              </div>
              <p className="tool-check-description">{check.description}</p>
              {check.details?.length ? (
                <details className="tool-record-details">
                  <summary>View DNS evidence</summary>
                  <div>
                    {check.details.map((detail) => (
                      <code key={`${check.title}-${detail}`}>{detail}</code>
                    ))}
                  </div>
                </details>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="tool-next-steps">
          <div>
            <p className="tool-overline">Next steps</p>
            <h3>{report.suggestions.length ? "Items to address" : "No priority DNS fixes"}</h3>
          </div>
          {report.suggestions.length ? (
            <ul>
              {report.suggestions.map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          ) : (
            <p>{clearMessage}</p>
          )}
        </div>
      </div>
    </section>
  );
}
