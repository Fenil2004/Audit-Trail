import { auditEvents } from "../../data/auditEvents";
import EventTimeline from "./EventTimeline";
import AuditSeal from "./AuditSeal";

export default function AuditDashboard() {
  const verifiedCount = auditEvents.filter(
    (event) => event.status === "VERIFIED"
  ).length;

  return (
    <main className="audit-dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">M5 • AUDIT TRAIL</p>
          <h1>Cryptographic Audit Center</h1>

          <p className="dashboard-subtitle">
            Chronological events, hash inspection, and integrity status.
          </p>
        </div>

        <div className="audit-counter">
          <span className="counter-number">{auditEvents.length}</span>
          <span className="counter-label">Total Events</span>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="timeline-panel">
          <EventTimeline events={auditEvents} />
        </div>

        <aside className="seal-panel">
          <AuditSeal
            verified={
              auditEvents.length > 0 &&
              verifiedCount === auditEvents.length
            }
          />

          <div className="integrity-note">
            <h3>Integrity Overview</h3>
            <p>
              {verifiedCount} of {auditEvents.length} events are marked
              as verified in the demo dataset.
            </p>
            <p>
              These statuses are sample data and are not proof that the
              event hashes have been cryptographically verified.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}