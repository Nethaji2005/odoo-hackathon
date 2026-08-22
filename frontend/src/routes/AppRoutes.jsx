import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/common/ProtectedRoute";
import RoleGuard from "../components/common/RoleGuard";

import AdminAttendance from "../pages/AdminAttendance";
import Attendance from "../pages/Attendance";
import Dashboard from "../pages/Dashboard";
import Employees from "../pages/Employees";
import Leave from "../pages/Leave";
import LeaveApprovals from "../pages/LeaveApprovals";
import Login from "../pages/Login";
import Payroll from "../pages/Payroll";
import PayrollControl from "../pages/PayrollControl";
import Profile from "../pages/Profile";
import Signup from "../pages/Signup";
import VerifyEmail from "../pages/VerifyEmail";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["employee", "admin"]}>
                <Attendance />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-attendance"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["admin"]}>
                <AdminAttendance />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["employee"]}>
                <Leave />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payroll"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["employee"]}>
                <Payroll />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["admin"]}>
                <Employees />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-approvals"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["admin"]}>
                <LeaveApprovals />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payroll-control"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["admin"]}>
                <PayrollControl />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
