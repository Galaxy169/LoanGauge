import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useRole } from "../hooks/useRole";

export default function ProtectedRoute({ allowedRoles }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { role } = useRole();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}