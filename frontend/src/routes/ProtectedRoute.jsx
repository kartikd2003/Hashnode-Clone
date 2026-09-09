import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait until AuthContext finishes checking localStorage/token
  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  // User is not logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Supports both:
  // <ProtectedRoute>...</ProtectedRoute>
  // and
  // <ProtectedRoute />
  if (children) {
    return children;
  }

  return <Outlet />;
}

export default ProtectedRoute;