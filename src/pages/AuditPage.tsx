import AuditSeal from "../component/audit/AuditSeal";
import EventTimeline from "../component/audit/EventTimeline";
import mockEvents from "../data/mockEvents";

function AuditPage() {
return ( <main className="audit-page"> <header className="audit-page-header"> <div> <h1>Audit Trail</h1> <p>
Shipment event history and cryptographic audit records. </p> </div>
<AuditSeal verified={true} />
  </header>

  <section className="audit-summary">
    <div className="audit-summary-card">
      <h3>Total Events</h3>
      <p>{mockEvents.length}</p>
    </div>

    <div className="audit-summary-card">
      <h3>Shipment ID</h3>
      <p>{mockEvents[0]?.shipmentId ?? "N/A"}</p>
    </div>

    <div className="audit-summary-card">
      <h3>Audit Status</h3>
      <p className="audit-summary-verified">Verified</p>
    </div>
  </section>

  <section className="audit-timeline-section">
    <EventTimeline events={mockEvents} />
  </section>
</main>

);
}

export default AuditPage;
