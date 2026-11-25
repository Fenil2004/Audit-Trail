import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { createShipment } from "../../data/fetchShipments";

function CreateShipmentModel() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    origin: "",
    destination: "",
    expectedDelivery: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      await createShipment({
        ...form,
        expectedDelivery: new Date(form.expectedDelivery).toISOString(),
      });

      navigate("/shipments");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create shipment",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shipments-page">
      <section className="shipments-content">
        <h1>Create New Shipment</h1>
        <p>Enter the shipment details below.</p>

        <form onSubmit={handleSubmit} className="shipment-form">
          <label>
            Shipment Title
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Medical Supplies"
              required
            />
          </label>

          <label>
            Origin
            <input
              name="origin"
              value={form.origin}
              onChange={handleChange}
              placeholder="Enter origin"
              required
            />
          </label>

          <label>
            Destination
            <input
              name="destination"
              value={form.destination}
              onChange={handleChange}
              placeholder="Enter destination"
              required
            />
          </label>

          <label>
            Expected Delivery
            <input
              type="datetime-local"
              name="expectedDelivery"
              value={form.expectedDelivery}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </label>

          {error && <p className="shipment-error">{error}</p>}

          <div className="shipment-form-actions">
            <button
              type="button"
              onClick={() => navigate("/shipments")}
              disabled={loading}
            >
              Cancel
            </button>

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Shipment"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default CreateShipmentModel;