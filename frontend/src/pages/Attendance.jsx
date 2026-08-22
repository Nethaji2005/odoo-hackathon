import { useState } from "react";
import Layout from "../components/layout/Layout";

import AdminAttendance from "./AdminAttendance";
import { useAuth } from "../context/AuthContext";
import { getAttendance } from "../utils/storage";

function Attendance() {
  const { user } = useAuth();

  const [view, setView] = useState("daily");

  const attendance = getAttendance();

  if (user.role === "admin") {
    return <AdminAttendance />;
  }

  const myAttendance = attendance.filter((item) => item.employeeId === user.id);

  const weeklyRecords = myAttendance.slice(0, 7);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Attendance</h1>

          <p>Track your daily attendance and working hours.</p>
        </div>

        <div className="toggle-group">
          <button className={view === "daily" ? "toggle active" : "toggle"} onClick={() => setView("daily")}>
            Daily
          </button>

          <button className={view === "weekly" ? "toggle active" : "toggle"} onClick={() => setView("weekly")}>
            Weekly
          </button>
        </div>
      </div>

      {view === "daily" ? (
        <section className="content-card">
          <div className="card-heading">
            <div>
              <h2>Attendance History</h2>

              <p>Your recent attendance records.</p>
            </div>
          </div>

          <AttendanceTable records={myAttendance} />
        </section>
      ) : (
        <WeeklyAttendance records={weeklyRecords} />
      )}
    </Layout>
  );
}

function AttendanceTable({ records }) {
  if (records.length === 0) {
    return <div className="empty-state">No attendance records found.</div>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Total Hours</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{record.date}</td>
              <td>{record.checkIn}</td>
              <td>{record.checkOut}</td>
              <td>{record.totalHours}</td>
              <td>
                <span
                  className={`status-badge ${
                    record.status === "Present" ? "success" : record.status === "Leave" ? "warning" : "danger"
                  }`}
                >
                  {record.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WeeklyAttendance({ records }) {
  const present = records.filter((item) => item.status === "Present").length;
  const absent = records.filter((item) => item.status === "Absent").length;
  const leave = records.filter((item) => item.status === "Leave").length;

  return (
    <section className="content-card">
      <div className="card-heading">
        <div>
          <h2>Weekly Attendance</h2>

          <p>Weekly attendance summary</p>
        </div>
      </div>

      <div className="admin-summary">
        <div>
          <span>Present</span>
          <strong>{present}</strong>
        </div>

        <div>
          <span>Absent</span>
          <strong>{absent}</strong>
        </div>

        <div>
          <span>Leave</span>
          <strong>{leave}</strong>
        </div>
      </div>

      <AttendanceTable records={records} />
    </section>
  );
}

export default Attendance;