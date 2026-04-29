import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext.jsx";

/**
 * Wraps a route to require authentication.
 * Optionally requires a specific role (e.g. "boss", "client", "employee").
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated, role } = useAuth();

  if (loading) {
    return <div style={{ padding: 20 }}>Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    // Not logged in: redirect to login
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // Logged in but wrong role: redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
