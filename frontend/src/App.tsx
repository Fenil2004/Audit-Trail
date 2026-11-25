import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/login";
import Register from "./pages/auth/Register";
import AuditDashboard from "./components/audit/AuditDashboard";

import Shipments from "./pages/shipments/Shipments";
import ShipmentDetails from "./pages/shipments/ShipmentDetails";
import CreateShipmentModel from "./components/shipments/CreateShipmentModel";

import "./styles/audit.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<AuditDashboard />} />

        <Route path="/shipments" element={<Shipments />} />
        <Route path="/shipments/create" element={<CreateShipmentModel />} />
        <Route path="/shipments/:id" element={<ShipmentDetails />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;