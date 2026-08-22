import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";

import { useAuth } from "../context/AuthContext";
import { getActivities, getLeaveRequests, getAttendance } from "../utils/storage";

function EmployeeDashboard() {
  const { user } = useAuth();

  const attendance = getAttendance().filter((item) => item.employeeId === user.id);

  const todayAttendance = attendance.find((item) => item.date === "2026-08-22") || attendance[0];

  const leaveRequests = getLeaveRequests().filter((item) => item.employeeId === user.id);

  const activities = getActivities().filter((item) => item.employeeId === user.id);

  const pendingLeaves = leaveRequests.filter((item) => item.status === "Pending").length;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>

          <p>Welcome back, {user.name}. Here's your overview.</p>
        </div>

        <div className="today-box">
          <span>Today</span>
          <strong>22 Aug 2026</strong>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">✓</div>

          <div>
            <span>Attendance</span>
            <strong>{todayAttendance?.status || "Absent"}</strong>
            <small>Today's status</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">◷</div>

          <div>
            <span>Working Hours</span>
            <strong>{todayAttendance?.totalHours || "00:00"}</strong>
            <small>Today's working time</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">□</div>

          <div>
            <span>Leave Balance</span>
            <strong>12 Days</strong>
            <small>Remaining leave</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">◎</div>

          <div>
            <span>Employee</span>
            <strong>{user.status}</strong>
            <small>Account status</small>
          </div>
        </div>
      </div>

      <div className="two-column-grid">
        <section className="content-card">
          <div className="card-heading">
            <div>
              <h2>Today's Attendance</h2>

              <p>Your attendance information</p>
            </div>

            <span className="status-badge success">{todayAttendance?.status || "Absent"}</span>
          </div>

          <div className="mini-grid">
            <div>
              <span>Check In</span>
              <strong>{todayAttendance?.checkIn || "-"}</strong>
            </div>

            <div>
              <span>Check Out</span>
              <strong>{todayAttendance?.checkOut || "-"}</strong>
            </div>

            <div>
              <span>Total Hours</span>
              <strong>{todayAttendance?.totalHours || "-"}</strong>
            </div>
          </div>

          <Link to="/attendance" className="primary-button inline-button">
            View Attendance
          </Link>
        </section>

        <section className="content-card">
          <div className="card-heading">
            <div>
              <h2>Leave Summary</h2>

              <p>Your current leave information</p>
            </div>
          </div>

          <div className="mini-grid">
            <div>
              <span>Available</span>
              <strong>12</strong>
            </div>

            <div>
              <span>Used</span>
              <strong>06</strong>
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingLeaves}</strong>
            </div>
          </div>

          <Link to="/leave" className="secondary-button inline-button">
            Manage Leave
          </Link>
        </section>
      </div>

      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>Recent Activity</h2>

            <p>Your latest activity</p>
          </div>
        </div>

        <div className="activity-list">
          {activities.length === 0 ? (
            <div className="empty-state">No recent activity.</div>
          ) : (
            activities.map((activity) => (
              <div className="activity-item" key={activity.id}>
                <div className="activity-icon">✓</div>

                <div>
                  <strong>{activity.title}</strong>

                  <p>{activity.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </Layout>
  );
}

export default EmployeeDashboard;