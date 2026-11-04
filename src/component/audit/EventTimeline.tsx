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

  if (sortedEvents.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Audit Events Found</h3>
        <p>There are currently no events available for this shipment.</p>
      </div>
    );
  }

  return (
    <div className="event-timeline">
      {sortedEvents.map((event) => (
        <EventCard key={event.eventId} event={event} />
      ))}
    </div>
  );
}

export default EventTimeline;