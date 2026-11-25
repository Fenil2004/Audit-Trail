import { useMemo, useState } from "react";
import type { AuditEvent } from "../../data/auditEvents";
import HashPill from "./HashPill";

interface EventTimelineProps {
  events: AuditEvent[];
}

function formatDate(timestamp: string): string {
  return (
    new Date(timestamp).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }) + " UTC"
  );
}

export default function EventTimeline({
  events,
}: EventTimelineProps) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const sortedEvents = useMemo(() => {
    return [...events]
      .filter((event) => {
        const matchesFilter =
          filter === "ALL" || event.status === filter;

        const query = search.toLowerCase();

        const matchesSearch =
          event.title.toLowerCase().includes(query) ||
          event.id.toLowerCase().includes(query) ||
          (event.shipmentId ?? "").toLowerCase().includes(query) ||
          event.actor.toLowerCase().includes(query);

        return matchesFilter && matchesSearch;
      })
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() -
          new Date(b.timestamp).getTime(),
      );
  }, [events, filter, search]);

  return (
    <section className="timeline-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">AUDIT HISTORY</p>
          <h2>Event Timeline</h2>
          <p className="section-description">
            Review shipment activity and cryptographic records.
          </p>
        </div>

        <span className="event-count">
          {sortedEvents.length} Records
        </span>
      </div>

      <div className="timeline-toolbar">
        <input
          type="search"
          className="timeline-search"
          placeholder="Search events, shipment or actor..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          className="timeline-filter"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label="Filter events by status"
        >
          <option value="ALL">All Events</option>
          <option value="SUCCESS">Success</option>
          <option value="PENDING">Pending</option>
          <option value="FLAGGED">Flagged</option>
        </select>
      </div>

      <div className="timeline">
        {sortedEvents.map((event) => (
          <article className="timeline-event" key={event.id}>
            <div className="timeline-marker">
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
                {event.shipmentId && (
                  <span>Shipment: {event.shipmentId}</span>
                )}

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
          <div className="empty-state">
            <h3>No events found</h3>
            <p>Try changing your search or status filter.</p>
          </div>
        )}
      </div>
    </section>
  );
}