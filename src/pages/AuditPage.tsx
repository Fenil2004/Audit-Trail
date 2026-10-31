import EventTimeline from "../component/audit/EventTimeline";
import mockEvents from "../data/mockEvents";

function AuditPage() {
  return (
    <main>
      <EventTimeline events={mockEvents} />
    </main>
  );
}

export default AuditPage;