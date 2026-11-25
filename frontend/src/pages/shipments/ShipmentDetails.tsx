import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  fetchShipment,
  updateShipmentStatus,
  type Shipment,
  type ShipmentStatus,
} from "../../data/fetchShipments";

function ShipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const isAdmin =
    JSON.parse(localStorage.getItem("authUser") || "{}").role === "admin";

  useEffect(() => {
    let active = true;

    const timer = setTimeout(() => {
      if (!id) {
        setError("Shipment ID is missing");
        setLoading(false);
        return;
      }

      fetchShipment(id)
        .then((data) => {
          if (active) setShipment(data);
        })
        .catch((err: unknown) => {
          if (active) {
            setError(
              err instanceof Error ? err.message : "Failed to load shipment",
            );
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [id]);

  async function handleStatusUpdate(status: ShipmentStatus) {
    if (!id) return;

    try {
      setUpdating(true);
      setError("");

      const updatedShipment = await updateShipmentStatus(id, status);
      setShipment(updatedShipment);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update shipment",
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return <main className="shipments-page">Loading shipment...</main>;
  }

  if (error && !shipment) {
    return (
      <main className="shipments-page">
        <p>{error}</p>
        <button onClick={() => navigate("/shipments")}>
          Back to Shipments
        </button>
      </main>
    );
  }

  if (!shipment) return null;

  return (
    <main className="shipments-page">
      <button
        type="button"
        className="shipment-view-btn"
        onClick={() => navigate("/shipments")}
      >
        ← Back to Shipments
      </button>

      <section className="shipments-content">
        <h1>{shipment.title}</h1>

        <div className="shipment-details-grid">
          <p><strong>Shipment ID:</strong> {shipment.shipmentId}</p>
          <p><strong>Origin:</strong> {shipment.origin}</p>
          <p><strong>Destination:</strong> {shipment.destination}</p>
          <p><strong>Status:</strong> {shipment.status.replace("_", " ")}</p>
          <p>
            <strong>Expected Delivery:</strong>{" "}
            {new Date(shipment.expectedDelivery).toLocaleString()}
          </p>
          <p><strong>Created By:</strong> {shipment.createdBy}</p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(shipment.createdAt).toLocaleString()}
          </p>
        </div>

        {error && <p className="shipment-error">{error}</p>}

        {isAdmin && shipment.status !== "DELIVERED" && (
          <div className="shipment-status-actions">
            <h3>Update Shipment Status</h3>

            {shipment.status === "CREATED" && (
              <button
                type="button"
                disabled={updating}
                onClick={() => void handleStatusUpdate("IN_TRANSIT")}
              >
                {updating ? "Updating..." : "Mark In Transit"}
              </button>
            )}

            {shipment.status === "IN_TRANSIT" && (
              <button
                type="button"
                disabled={updating}
                onClick={() => void handleStatusUpdate("DELIVERED")}
              >
                {updating ? "Updating..." : "Mark Delivered"}
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default ShipmentDetails;