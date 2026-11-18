import { useEffect, useState } from "react";
import type { AuditEvent } from "../../data/auditEvents";
import { fetchAuditEvents } from "../../data/fetchAuditEvents";
import EventTimeline from "./EventTimeline";
import AuditSeal from "./AuditSeal";

export default function AuditDashboard() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial API request
  useEffect(() => {
    let ignore = false;

    fetchAuditEvents()
      .then((data) => {
        if (!ignore) {
          setEvents(data);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong"
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Retry API request
  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchAuditEvents();
      setEvents(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

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
          <span className="counter-number">{events.length}</span>
          <span className="counter-label">Total Events</span>
        </div>
      </header>

      {loading && (
        <div className="api-state">
          <p>Loading audit events...</p>
        </div>
      )}

      {error && (
        <div className="api-error">
          <p>{error}</p>

          <button type="button" onClick={loadEvents}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="dashboard-grid">
          <div className="timeline-panel">
            <EventTimeline events={events} />
          </div>

          <aside className="seal-panel">
            <AuditSeal verified={false} />

            <div className="integrity-note">
              <h3>Integrity Overview</h3>

              <p>{events.length} events loaded from the backend.</p>

              <p>
                Cryptographic verification has not yet been implemented.
                Event status does not establish hash integrity.
              </p>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}