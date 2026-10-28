import { useMemo, useState } from "react";
import type { AuditEvent } from "../../data/auditEvents";
import HashPill from "./HashPill";

interface EventTimelineProps {
  events: AuditEvent[];
}

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "UTC",
  }) + " UTC";
}

export default function EventTimeline({
  events,
}: EventTimelineProps) {
  const [filter, setFilter] = useState("ALL");

  const sortedEvents = useMemo(() => {
    return [...events]
      .filter((event) => filter === "ALL" || event.status === filter)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() -
          new Date(b.timestamp).getTime()
      );
  }, [events, filter]);

  return (
    <section className="timeline-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">AUDIT HISTORY</p>
          <h2>Chronological Event Timeline</h2>
          <p className="section-description">
            Track events and inspect their cryptographic hashes.
          </p>
        </div>

        <select
          className="timeline-filter"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label="Filter events by status"
        >
          <option value="ALL">All Events</option>
          <option value="VERIFIED">Verified</option>
          <option value="PENDING">Pending</option>
          <option value="FLAGGED">Flagged</option>
        </select>
      </div>

      <div className="timeline">
        {sortedEvents.map((event) => (
          <article className="timeline-event" key={event.id}>
            <div className="timeline-marker" aria-hidden="true">
              <span />
            </div>

            <div className="event-card">
              <div className="event-top">
                <span className="event-id">{event.id}</span>

                <span
                  className={`status-badge status-${event.status.toLowerCase()}`}
                >
                  {event.status}
                </span>
              </div>

              <h3>{event.title}</h3>

              <p className="event-description">
                {event.description}
              </p>

              <div className="event-meta">
                <span>Actor: {event.actor}</span>
                <span>{formatDate(event.timestamp)}</span>
              </div>

              <div className="hash-area">
                <span className="hash-label">SHA-256 HASH</span>
                <HashPill hash={event.hash} />
              </div>
            </div>
          </article>
        ))}

        {sortedEvents.length === 0 && (
          <p className="empty-state">
            No events found for this status.
          </p>
        )}
      </div>
    </section>
  );
}