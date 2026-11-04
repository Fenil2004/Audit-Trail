import EventTimeline from "../component/audit/EventTimeline";
import AuditSeal from "../component/audit/AuditSeal";
import { mockEvents } from "../data/mockEvents";

function AuditPage() {
  const events = mockEvents;

  // Temporary UI status.
  // Actual hash-chain verification will be implemented in Week 3.
  const verified = events.length > 0;

  return (
    <main className="audit-page">
      <header className="audit-header">
        <div>
          <h1>Audit Trail Dashboard</h1>
          <p>Shipment tracking and event verification system</p>
        </div>

        <span className="shipment-badge">SHP-001</span>
      </header>

      <section className="audit-summary">
        <div className="summary-card">
          <h3>Total Events</h3>
          <p>{events.length}</p>
        </div>

        <div className="summary-card">
          <h3>Shipment ID</h3>
          <p>SHP-001</p>
        </div>

        <div className="summary-card">
          <h3>Audit Status</h3>
          <p>{verified ? "Available" : "Pending"}</p>
        </div>
      </section>

      <section className="audit-content">
        <div className="timeline-section">
          <h2>Shipment Event Timeline</h2>
          <EventTimeline events={events} />
        </div>

        <aside className="verification-section">
          <h2>Audit Verification</h2>
          <AuditSeal verified={verified} />
        </aside>
      </section>
    </main>
  );
}

export default AuditPage;