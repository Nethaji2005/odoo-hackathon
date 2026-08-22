import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import EmployeeProfile from "../pages/EmployeeProfile.jsx";
import Payroll from "../pages/Payroll.jsx";

/**
 * AppRoutes — all routes for the Employee Profile + Payroll module.
 *
 * Member 4 (Dashboard) should wrap these in their layout component.
 * Member 1 (Auth) should add a PrivateRoute wrapper here to redirect
 * unauthenticated users to /login.
 *
 * Current routes:
 *   /profile              → own profile
 *   /profile/:id          → admin views another employee's profile
 *   /payroll              → own payroll
 *   /payroll/:employeeId  → admin manages employee payroll
 */
function PrivateRoute({ children }) {
  const { user, token } = useAuth();

  // If no token, show a placeholder until Member 1's auth is ready
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-surface)" }}>
        <div className="card text-center max-w-sm">
          <p className="text-white font-semibold text-lg mb-2">Authentication Required</p>
          <p className="text-slate-400 text-sm">
            Please log in to continue.
            <br />
            <span className="text-indigo-400 text-xs">
              (Set "dayflow_token" in localStorage to test without auth module)
            </span>
          </p>
        </div>
      </div>
    );
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/profile" replace />} />

      {/* Employee Profile */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <EmployeeProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <PrivateRoute>
            <EmployeeProfile />
          </PrivateRoute>
        }
      />

      {/* Payroll */}
      <Route
        path="/payroll"
        element={
          <PrivateRoute>
            <Payroll />
          </PrivateRoute>
        }
      />
      <Route
        path="/payroll/:employeeId"
        element={
          <PrivateRoute>
            <Payroll />
          </PrivateRoute>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-surface)" }}>
            <div className="text-center">
              <p className="text-6xl font-black text-slate-700">404</p>
              <p className="text-slate-400 mt-2">Page not found</p>
            </div>
          </div>
        }
      />
    </Routes>
  );
}
