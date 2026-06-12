import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * A wrapper for routes that require authentication.
 * 
 * @param {{ children: React.ReactNode, allowedRoles?: string[] }} props
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // Logged in, but lacks the required role
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // All checks passed, render the route
  return children;
}
