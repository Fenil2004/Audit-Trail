import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/login";
import Register from "./pages/auth/Register";
import AuditDashboard from "./components/audit/AuditDashboard";

import Shipments from "./pages/shipments/Shipments";
import ShipmentDetails from "./pages/shipments/ShipmentDetails";
import CreateShipmentModel from "./components/shipments/CreateShipmentModel";

import ProtectedRoute from "./components/auth/ProtectedRoute";

import "./styles/audit.css";

function App() {
  const token = localStorage.getItem("authToken");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={token ? "/dashboard" : "/login"}
              replace
            />
          }
        />

        {/* Public Routes */}
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        {/* Routes requiring authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<AuditDashboard />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/shipments/:id" element={<ShipmentDetails />} />
        </Route>

        {/* Admin-only routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/shipments/create" element={<CreateShipmentModel />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;