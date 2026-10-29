
import type { AuditEvent } from "../../types/audit";

interface EventCardProps {
  event: AuditEvent;
}

function EventCard({ event }: EventCardProps) {
  const statusClass = event.status.toLowerCase();

  return (
    <div className="event-card">
      <div className="event-card-header">
        <h3>{event.eventType.replaceAll("_", " ")}</h3>

        <span className={`event-status ${statusClass}`}>
          {event.status}
        </span>
      </div>

      <p className="event-description">{event.description}</p>

      <div className="event-card-details">
        <p>
          <strong>Shipment:</strong> {event.shipmentId}
        </p>

        <p>
          <strong>Actor:</strong> {event.actor}
        </p>

        <p>
          <strong>Timestamp:</strong>{" "}
          {new Date(event.timestamp).toLocaleString()}
        </p>
      </div>

      <div className="event-hash">
        <p>
          <strong>Hash:</strong> {event.hash}
        </p>

        <p>
          <strong>Previous Hash:</strong> {event.previousHash}
        </p>
      </div>
    </div>
  );
}

export default EventCard;