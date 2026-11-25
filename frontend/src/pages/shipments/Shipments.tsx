import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ShipmentTable from "../../components/shipments/ShipmentTable";
import {
  fetchShipments,
  type Shipment,
} from "../../data/fetchShipments";

function Shipments() {
  const navigate = useNavigate();

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadShipments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchShipments();
      setShipments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load shipments",
      );
    } finally {
      setLoading(false);
    }
  }, []);

useEffect(() => {
  const timer = setTimeout(() => {
    void loadShipments();
  }, 0);

  return () => clearTimeout(timer);
}, [loadShipments]);
  return (
    <main className="shipments-page">
      <header className="shipments-header">
        <div>
          <h1>Shipments</h1>
          <p>Manage and track all your shipments.</p>
        </div>

        <button
          type="button"
          className="shipment-create-btn"
          onClick={() => navigate("/shipments/create")}
        >
          + Create Shipment
        </button>
      </header>

      <section className="shipments-content">
        <div className="shipments-summary">
          <h2>All Shipments</h2>
          <span>{shipments.length} Total</span>
        </div>

        {loading ? (
          <p className="shipment-message">Loading shipments...</p>
        ) : error ? (
          <div className="shipment-error">
            <p>{error}</p>
            <button type="button" onClick={() => void loadShipments()}>
              Retry
            </button>
          </div>
        ) : (
          <ShipmentTable
            shipments={shipments}
            onView={(id) => navigate(`/shipments/${id}`)}
          />
        )}
      </section>
    </main>
  );
}

export default Shipments;