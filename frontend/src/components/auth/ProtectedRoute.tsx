import { Navigate, Outlet } from "react-router-dom";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: "admin" | "user";
}

interface ProtectedRouteProps {
  allowedRoles?: AuthUser["role"][];
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem("authToken");
  const storedUser = localStorage.getItem("authUser");

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  let user: AuthUser;

  try {
    user = JSON.parse(storedUser) as AuthUser;
  } catch {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;