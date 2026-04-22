import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading authentication...</div>; 
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;