import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireRole({
  allowed,
  children,
}) {
  const { user } = useAuth();
  const loc = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (!allowed.includes(user.role)) return <Navigate to="/login" replace />;

  return <>{children}</>;
}