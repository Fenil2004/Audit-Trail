import type { AuditEvent } from "../../types/audit";
import HashPill from "./HashPill";

interface EventCardProps {
event: AuditEvent;
}

function EventCard({ event }: EventCardProps) {
const statusClass = event.status.toLowerCase();

const formattedEventType = event.eventType.replaceAll("_", " ");

const formattedTimestamp = new Date(
event.timestamp
).toLocaleString();

return ( <div className="event-card"> <div className="event-card-header"> <h3>{formattedEventType}</h3>


    <span className={`event-status ${statusClass}`}>
      {event.status}
    </span>
  </div>

  <p className="event-description">
    {event.description}
  </p>

  <div className="event-card-details">
    <p>
      <strong>Shipment:</strong> {event.shipmentId}
    </p>

    <p>
      <strong>Actor:</strong> {event.actor}
    </p>

    <p>
      <strong>Timestamp:</strong> {formattedTimestamp}
    </p>
  </div>

  <div className="event-hash">
    <div className="hash-row">
      <strong>Hash:</strong>
      <HashPill hash={event.hash} />
    </div>

    <div className="hash-row">
      <strong>Previous Hash:</strong>
      <HashPill hash={event.previousHash} />
    </div>
  </div>
</div>

);
}

export default EventCard;
