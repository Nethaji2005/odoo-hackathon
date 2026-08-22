import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import DashboardLayout from '../layouts/DashboardLayout'
import LoginPage from '../pages/LoginPage'
import AttendancePage from '../pages/attendance/AttendancePage'
import AdminAttendancePage from '../pages/attendance/AdminAttendancePage'
import LeavePage from '../pages/leave/LeavePage'
import AdminLeavePage from '../pages/leave/AdminLeavePage'
import EmployeeProfile from '../pages/EmployeeProfile'
import Payroll from '../pages/Payroll'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected — employee */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/profile" replace />} />
        
        {/* Profile */}
        <Route path="profile" element={<EmployeeProfile />} />
        <Route path="profile/:id" element={<EmployeeProfile />} />
        
        {/* Payroll */}
        <Route path="payroll" element={<Payroll />} />
        <Route path="payroll/:employeeId" element={<Payroll />} />

        {/* Attendance & Leave */}
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leave" element={<LeavePage />} />

        {/* Protected — admin/HR only */}
        <Route
          path="admin/attendance"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/leave"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLeavePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
