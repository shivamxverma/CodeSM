import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

function RequireRole({ allowed, children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  if (!allowed.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default RequireRole;