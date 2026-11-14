import { useEffect, useState } from "react";

import EventTimeline from "../component/audit/EventTimeline";
import AuditSeal from "../component/audit/AuditSeal";
import { mockEvents } from "../data/mockEvents";

import { createHashChain } from "../utils/hashChain";
import { verifyHashChain } from "../utils/verifyHashChain";

function AuditPage() {
  const events = mockEvents;

  const [verificationStatus, setVerificationStatus] = useState<
    "checking" | "verified" | "unverified"
  >("checking");

  useEffect(() => {
    let cancelled = false;

    async function verifyAudit() {
      try {
        const chainedEvents = await createHashChain(events);

        const result = await verifyHashChain(chainedEvents);

        if (!cancelled) {
          setVerificationStatus(result.valid ? "verified" : "unverified");
        }
      } catch (error) {
        console.error("Audit verification error:", error);

        if (!cancelled) {
          setVerificationStatus("unverified");
        }
      }
    }

    verifyAudit();

    return () => {
      cancelled = true;
    };
  }, [events]);

  const verified = verificationStatus === "verified";

  return (
    <main className="audit-page">
      <header className="audit-header">
        <div>
          <h1>Audit Trail Dashboard</h1>
          <p>Shipment tracking and event verification system</p>
        </div>

        <span className="shipment-badge">SHP-001</span>
      </header>

      <section className="audit-summary">
        <div className="summary-card">
          <h3>Total Events</h3>
          <p>{events.length}</p>
        </div>

        <div className="summary-card">
          <h3>Shipment ID</h3>
          <p>SHP-001</p>
        </div>

        <div className="summary-card">
          <h3>Audit Status</h3>
          <p>
            {verificationStatus === "checking"
              ? "Checking..."
              : verified
              ? "Verified"
              : "Tampering Detected"}
          </p>
        </div>
      </section>

      <section className="audit-content">
        <div className="timeline-section">
          <h2>Shipment Event Timeline</h2>
          <EventTimeline events={events} />
        </div>

        <aside className="verification-section">
          <h2>Audit Verification</h2>
          <AuditSeal status={verificationStatus} />
        </aside>
      </section>
    </main>
  );
}

export default AuditPage;