
import { useEffect, useState } from "react";
import type { AuditEvent } from "../../data/auditEvents";

import {
  createAuditEvent,
  deleteAuditEvent,
  fetchAuditEvents,
  updateAuditEvent,
  type CreateEventInput,
  type EventType,
  type EventStatus,
} from "../../data/fetchAuditEvents";

import EventTimeline from "./EventTimeline";
import AuditSeal from "./AuditSeal";

const initialForm: CreateEventInput = {
  shipmentId: "",
  eventType: "SHIPMENT_CREATED",
  actor: "",
  description: "",
  status: "SUCCESS",
};

export default function AuditDashboard() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateEventInput>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editActor, setEditActor] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<EventStatus>("SUCCESS");
  const [actionError, setActionError] = useState<string | null>(null);

  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchAuditEvents();
      setEvents(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    fetchAuditEvents()
      .then((data) => {
        if (!ignore) setEvents(data);
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Something went wrong",
          );
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setActionError(null);

      await createAuditEvent(form);

      setForm(initialForm);
      await loadEvents();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to create event",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function startEditing(event: AuditEvent) {
    setEditingId(event.id);
    setEditActor(event.actor);
    setEditDescription(event.description);

    setEditStatus(
      event.status === "SUCCESS"
        ? "SUCCESS"
        : event.status === "FLAGGED"
          ? "CRITICAL"
          : "PENDING",
    );
  }

  async function handleUpdate(id: string) {
    try {
      setActionError(null);

      await updateAuditEvent(id, {
        actor: editActor,
        description: editDescription,
        status: editStatus,
      });

      setEditingId(null);
      await loadEvents();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update event",
      );
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this audit event?",
    );

    if (!confirmed) return;

    try {
      setActionError(null);

      await deleteAuditEvent(id);
      await loadEvents();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete event",
      );
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
        <>
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

          <section className="crud-panel">
            <h2>Create Shipment Event</h2>

            <form className="event-form" onSubmit={handleCreate}>
              <input
                type="text"
                placeholder="Shipment ID"
                value={form.shipmentId}
                onChange={(e) =>
                  setForm({ ...form, shipmentId: e.target.value })
                }
                required
              />

              <select
                value={form.eventType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    eventType: e.target.value as EventType,
                  })
                }
              >
                <option value="SHIPMENT_CREATED">Shipment Created</option>
                <option value="SHIPMENT_DISPATCHED">Shipment Dispatched</option>
                <option value="TEMPERATURE_RECORDED">Temperature Recorded</option>
                <option value="EXCURSION_DETECTED">Excursion Detected</option>
                <option value="SHIPMENT_DELIVERED">Shipment Delivered</option>
              </select>

              <input
                type="text"
                placeholder="Actor"
                value={form.actor}
                onChange={(e) =>
                  setForm({ ...form, actor: e.target.value })
                }
                required
              />

              <input
                type="text"
                placeholder="Event description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as EventStatus,
                  })
                }
              >
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="CRITICAL">Critical</option>
              </select>

              <button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Event"}
              </button>
            </form>

            {actionError && (
              <p className="crud-error">{actionError}</p>
            )}

            <h2>Manage Audit Events</h2>

            {events.length === 0 && <p>No audit events available.</p>}

            <div className="event-management-list">
              {events.map((event) => (
                <article className="event-management-card" key={event.id}>
                  {editingId === event.id ? (
                    <div className="event-edit-form">
                      <input
                        value={editActor}
                        onChange={(e) => setEditActor(e.target.value)}
                        placeholder="Actor"
                      />

                      <input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                      />

                      <select
                        value={editStatus}
                        onChange={(e) =>
                          setEditStatus(e.target.value as EventStatus)
                        }
                      >
                        <option value="SUCCESS">Success</option>
                        <option value="PENDING">Pending</option>
                        <option value="FAILED">Failed</option>
                        <option value="CRITICAL">Critical</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleUpdate(event.id)}
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3>{event.title}</h3>
                        <p>{event.description}</p>
                        <small>Actor: {event.actor}</small>
                      </div>

                      <div className="event-actions">
                        <button
                          type="button"
                          onClick={() => startEditing(event)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(event.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
