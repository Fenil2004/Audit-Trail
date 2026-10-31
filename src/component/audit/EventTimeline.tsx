import type { AuditEvent } from "../../types/audit";
import EventCard from "./EventCard";

interface EventTimelineProps {
events: AuditEvent[];
}

function EventTimeline({ events }: EventTimelineProps) {
const sortedEvents = [...events].sort(
(a, b) =>
new Date(b.timestamp).getTime() -
new Date(a.timestamp).getTime()
);

if (events.length === 0) {
return <p className="empty-timeline">No audit events found.</p>;
}

return ( <div className="event-timeline"> <h2>Audit Event Timeline</h2>

  <div className="timeline-list">
    {sortedEvents.map((event) => (
      <div className="timeline-item" key={event.eventId}>
        <div className="timeline-marker"></div>

        <EventCard event={event} />
      </div>
    ))}
  </div>
</div>
);
}

export default EventTimeline;
