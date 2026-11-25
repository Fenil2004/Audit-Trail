import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { AuditEvent } from "../../data/auditEvents";

import {
  createAuditEvent,
  fetchAuditEvents,
  verifyAuditEvent,
  type CreateEventInput,
  type EventType,
  type EventStatus,
  type VerificationStatus,
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

type IntegrityStatus =
  | VerificationStatus
  | "UNVERIFIED"
  | "CHECKING";

export default function AuditDashboard() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateEventInput>(initialForm);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Check admin role during state initialization
  const [isAdmin] = useState<boolean>(() => {
    try {
      const storedUser = localStorage.getItem("authUser");

      if (!storedUser) {
        return false;
      }

      const user: { role?: string } = JSON.parse(storedUser);

      return user.role === "admin";
    } catch {
      return false;
    }
  });

  // Integrity verification state
  const [integrityStatus, setIntegrityStatus] =
    useState<IntegrityStatus>("CHECKING");

  const [integrityMessage, setIntegrityMessage] = useState(
    "Checking shipment hash chains...",
  );

  // Fetch events and verify shipment hash chains
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      setIntegrityStatus("CHECKING");
      setIntegrityMessage("Checking shipment hash chains...");

      const data = await fetchAuditEvents();

      setEvents(data);

      if (data.length === 0) {
        setIntegrityStatus("UNVERIFIED");
        setIntegrityMessage(
          "No audit records are available to verify.",
        );
        return;
      }

      // Get the first event of every shipment
      const shipmentFirstEvents = new Map<string, AuditEvent>();

      for (const event of data) {
        const shipmentKey = event.shipmentId || event.id;

        if (!shipmentFirstEvents.has(shipmentKey)) {
          shipmentFirstEvents.set(shipmentKey, event);
        }
      }

      // Verify every shipment's hash chain
      const results = await Promise.all(
        Array.from(shipmentFirstEvents.values()).map((event) =>
          verifyAuditEvent(event.id),
        ),
      );

      const tampered = results.some(
        (result) => result.verificationStatus === "TAMPERED",
      );

      const allVerified = results.every(
        (result) => result.verificationStatus === "VERIFIED",
      );

      if (tampered) {
        setIntegrityStatus("TAMPERED");
        setIntegrityMessage(
          "At least one shipment hash chain failed integrity verification.",
        );
      } else if (allVerified) {
        setIntegrityStatus("VERIFIED");
        setIntegrityMessage(
          `All ${results.length} shipment hash chain(s) passed verification.`,
        );
      } else {
        setIntegrityStatus("UNVERIFIED");
        setIntegrityMessage(
          "One or more shipment hash chains could not be verified.",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading audit records.",
      );

      setIntegrityStatus("UNVERIFIED");
      setIntegrityMessage(
        "Unable to complete integrity verification.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Load dashboard data
  useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadEvents();
  }, 0);

  return () => {
    window.clearTimeout(timer);
  };
}, [loadEvents]);

  // Create shipment event
  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();


    try {
      setSubmitting(true);
      setActionError(null);

      await createAuditEvent(form);

      setForm(initialForm);

      await loadEvents();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to create audit event.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Dashboard statistics
  const successCount = events.filter(
    (event) => event.status === "SUCCESS",
  ).length;

  const pendingCount = events.filter(
    (event) => event.status === "PENDING",
  ).length;

  const flaggedCount = events.filter(
    (event) => event.status === "FLAGGED",
  ).length;

  return (
    <main className="audit-dashboard">

      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="brand-mark">A</div>
          <span>AuditTrail</span>
        </div>

        <div className="dashboard-heading">
          <p className="eyebrow">OPERATIONS OVERVIEW</p>

          <h1>Audit Dashboard</h1>

          <p className="dashboard-subtitle">
            Monitor shipment activity and verify audit integrity.
          </p>
        </div>

        <button
          className="refresh-button"
          type="button"
          onClick={() => void loadEvents()}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </header>

      {/* API Error */}
      {error && (
        <div className="api-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => void loadEvents()}
          >
            Retry
          </button>
        </div>
      )}

      {/* Statistics */}
      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-label">Total Events</span>
          <strong>{events.length}</strong>
          <span className="stat-caption">
            Recorded audit events
          </span>
        </article>

        <article className="stat-card success-card">
          <span className="stat-label">Successful</span>
          <strong>{successCount}</strong>
          <span className="stat-caption">
            Successful operations
          </span>
        </article>

        <article className="stat-card pending-card">
          <span className="stat-label">Pending</span>
          <strong>{pendingCount}</strong>
          <span className="stat-caption">
            Awaiting completion
          </span>
        </article>

        <article className="stat-card flagged-card">
          <span className="stat-label">Flagged</span>
          <strong>{flaggedCount}</strong>
          <span className="stat-caption">
            Critical or failed events
          </span>
        </article>
      </section>

      {/* Main Dashboard */}
      {loading ? (
        <div className="api-state">
          <div className="loading-spinner" />
          <p>Loading audit records...</p>
        </div>
      ) : (
        <section className="dashboard-content">

          {/* Timeline */}
          <div className="timeline-panel">
            <EventTimeline events={events} />
          </div>

          {/* Integrity Sidebar */}
          <aside className="dashboard-sidebar">
            <AuditSeal
              status={integrityStatus}
              message={integrityMessage}
            />

            <div className="integrity-note">
              <h3>Integrity Overview</h3>

              <p>
                Verification is performed against the SHA-256
                hash chain stored in the backend.
              </p>

              <div className="integrity-detail">
                <span>Records checked</span>
                <strong>{events.length}</strong>
              </div>
            </div>
          </aside>

        </section>
      )}

      {/* Admin Only: Create Event */}
      {isAdmin && (
        <section className="create-panel">

          <div className="create-panel-heading">
            <div>
              <p className="eyebrow">EVENT MANAGEMENT</p>

              <h2>Create Shipment Event</h2>

              <p className="section-description">
                Add a new event to the shipment audit history.
              </p>
            </div>
          </div>

          <form
            className="event-form"
            onSubmit={handleCreate}
          >

            <label>
              Shipment ID

              <input
                type="text"
                placeholder="e.g. SHP-002"
                value={form.shipmentId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    shipmentId: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Event Type

              <select
                value={form.eventType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    eventType: e.target.value as EventType,
                  })
                }
              >
                <option value="SHIPMENT_CREATED">
                  Shipment Created
                </option>

                <option value="SHIPMENT_DISPATCHED">
                  Shipment Dispatched
                </option>

                <option value="TEMPERATURE_RECORDED">
                  Temperature Recorded
                </option>

                <option value="EXCURSION_DETECTED">
                  Excursion Detected
                </option>

                <option value="SHIPMENT_DELIVERED">
                  Shipment Delivered
                </option>
              </select>
            </label>

            <label>
              Actor

              <input
                type="text"
                placeholder="e.g. warehouse_manager"
                value={form.actor}
                onChange={(e) =>
                  setForm({
                    ...form,
                    actor: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Event Status

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
            </label>

            <label className="description-field">
              Description

              <input
                type="text"
                placeholder="Describe the shipment event"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                required
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Creating Event..."
                : "+ Create Event"}
            </button>

          </form>

          {actionError && (
            <p className="crud-error">{actionError}</p>
          )}

        </section>
      )}

    </main>
  );
}