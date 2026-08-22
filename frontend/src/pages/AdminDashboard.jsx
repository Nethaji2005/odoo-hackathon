import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";

import { getUsers, getAttendance, getLeaveRequests } from "../utils/storage";

function AdminDashboard() {
  const users = getUsers();

  const employees = users.filter((item) => item.role === "employee");

  const attendance = getAttendance();

  const todayAttendance = attendance.filter((item) => item.date === "2026-08-22");

  const presentCount = todayAttendance.filter((item) => item.status === "Present").length;

  const absentCount = employees.length - presentCount;

  const leaveRequests = getLeaveRequests();

  const pendingLeaves = leaveRequests.filter((item) => item.status === "Pending");

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>

          <p>Organization overview and HR operations.</p>
        </div>

        <div className="today-box">
          <span>Today</span>
          <strong>22 Aug 2026</strong>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">♟</div>

          <div>
            <span>Employees</span>
            <strong>{employees.length}</strong>
            <small>Total employees</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">✓</div>

          <div>
            <span>Present Today</span>
            <strong>{presentCount}</strong>
            <small>Today's attendance</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">□</div>

          <div>
            <span>Pending Leaves</span>
            <strong>{pendingLeaves.length}</strong>
            <small>Need HR action</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">◎</div>

          <div>
            <span>Active Accounts</span>
            <strong>{employees.filter((item) => item.status === "Active").length}</strong>
            <small>Active employees</small>
          </div>
        </div>
      </div>

      <div className="two-column-grid">
        <section className="content-card">
          <div className="card-heading">
            <div>
              <h2>Today's Attendance</h2>

              <p>Organization-wide summary</p>
            </div>
          </div>

          <div className="admin-summary">
            <div>
              <span>Present</span>
              <strong>{presentCount}</strong>
            </div>

            <div>
              <span>Absent</span>
              <strong>{Math.max(absentCount, 0)}</strong>
            </div>
          </div>

          <Link to="/attendance" className="primary-button inline-button">
            View Attendance
          </Link>
        </section>

        <section className="content-card">
          <div className="card-heading">
            <div>
              <h2>Leave Approvals</h2>

              <p>Requests waiting for HR action</p>
            </div>
          </div>

          <div className="approval-highlight">
            <strong>{pendingLeaves.length}</strong>

            <span>pending requests</span>
          </div>

          <Link to="/leave-approvals" className="secondary-button inline-button">
            Manage Approvals
          </Link>
        </section>
      </div>

      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>Quick Employee List</h2>

            <p>Open an employee record</p>
          </div>

          <Link to="/employees" className="text-link">
            View All
          </Link>
        </div>

        <div className="employee-list">
          {employees.map((employee) => (
            <div className="employee-row" key={employee.id}>
              <div>
                <strong>{employee.name}</strong>
                <span>
                  {employee.department} · {employee.designation}
                </span>
              </div>

              <Link to={`/profile?employeeId=${employee.id}`} className="small-button">
                View
              </Link>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

export default AdminDashboard;