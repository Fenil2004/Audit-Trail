import type { Shipment } from "../../data/fetchShipments";

interface ShipmentTableProps {
  shipments: Shipment[];
  onView: (shipmentId: string) => void;
}

function ShipmentTable({ shipments, onView }: ShipmentTableProps) {
  if (shipments.length === 0) {
    return (
      <div className="shipment-empty">
        <h3>No shipments found</h3>
        <p>Create your first shipment to get started.</p>
      </div>
    );
  }

  return (
    <div className="shipment-table-wrapper">
      <table className="shipment-table">
        <thead>
          <tr>
            <th>Shipment ID</th>
            <th>Title</th>
            <th>Origin</th>
            <th>Destination</th>
            <th>Status</th>
            <th>Expected Delivery</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {shipments.map((shipment) => (
            <tr key={shipment.shipmentId}>
              <td>{shipment.shipmentId}</td>
              <td>{shipment.title}</td>
              <td>{shipment.origin}</td>
              <td>{shipment.destination}</td>
              <td>
                <span
                  className={`shipment-status status-${shipment.status.toLowerCase()}`}
                >
                  {shipment.status.replace("_", " ")}
                </span>
              </td>
              <td>
                {new Date(shipment.expectedDelivery).toLocaleDateString()}
              </td>
              <td>
                <button
                  type="button"
                  className="shipment-view-btn"
                  onClick={() => onView(shipment.shipmentId)}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ShipmentTable;