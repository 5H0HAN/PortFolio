const workflowStages = [
  {
    number: "01",
    title: "Diagnose",
    detail: "Map tenant, DNS, routing, and risk.",
    output: "Audit",
    className: "stage-one",
  },
  {
    number: "02",
    title: "Design",
    detail: "Build the migration and security plan.",
    output: "Runbook",
    className: "stage-two",
  },
  {
    number: "03",
    title: "Implement",
    detail: "Change Workspace and mail with control.",
    output: "Cutover",
    className: "stage-three",
  },
  {
    number: "04",
    title: "Verify + handoff",
    detail: "Test delivery, document, and transfer.",
    output: "Evidence",
    className: "stage-four",
  },
];

const serviceLanes = [
  "Workspace setup",
  "Email migration",
  "DNS authentication",
  "Deliverability",
];

export default function FarmerAnimation() {
  return (
    <div
      className="ops-field ops-workflow"
      role="img"
      aria-label="Shohan Biswas's workflow: diagnose the current system, design a plan, implement controlled changes, then verify and document the handoff"
    >
      <div className="ops-field-head">
        <span>Client operations / controlled change</span>
        <span className="ops-live">Workflow active</span>
      </div>

      <div className="workflow-map" aria-hidden="true">
        <div className="workflow-summary">
          <div>
            <span>Operating principle</span>
            <strong>Evidence before change.</strong>
          </div>
          <span className="workflow-status">Read-only first</span>
        </div>

        <div className="workflow-pipeline">
          <span className="workflow-spine" />
          <span className="workflow-signal" />
          {workflowStages.map((stage) => (
            <div
              className={`workflow-stage ${stage.className}`}
              key={stage.number}
            >
              <span className="workflow-step">{stage.number}</span>
              <div>
                <strong>{stage.title}</strong>
                <small>{stage.detail}</small>
              </div>
              <span className="workflow-output">{stage.output}</span>
            </div>
          ))}
        </div>

        <div className="workflow-handoff">
          <div>
            <span>Client outcome</span>
            <strong>Tested, documented, handoff-ready.</strong>
          </div>
          <span className="workflow-ready">Ready</span>
        </div>

        <div className="workflow-service-lanes">
          {serviceLanes.map((service) => (
            <span key={service}>{service}</span>
          ))}
        </div>
      </div>

      <div className="ops-field-foot">
        <span>Audit</span>
        <span>Plan</span>
        <span>Change</span>
        <span>Verify</span>
      </div>
    </div>
  );
}
