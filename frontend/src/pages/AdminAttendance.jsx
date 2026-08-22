import { useState } from "react";
import Layout from "../components/layout/Layout";

import { getAttendance, getUsers } from "../utils/storage";

function AdminAttendance() {
  const [selectedDate, setSelectedDate] = useState("2026-08-22");

  const users = getUsers().filter((user) => user.role === "employee");
  const attendance = getAttendance();

  const records = users.map((user) => {
    const record = attendance.find((item) => item.employeeId === user.id && item.date === selectedDate);

    return {
      user,
      record,
    };
  });

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Attendance</h1>
          <p>View attendance for all employees.</p>
        </div>

        <div className="date-filter">
          <label>Date</label>

          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>
      </div>

      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>Employee Attendance</h2>
            <p>Attendance for {selectedDate}</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Hours</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {records.map(({ user, record }) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                  </td>

                  <td>{user.id}</td>

                  <td>{record?.checkIn || "-"}</td>

                  <td>{record?.checkOut || "-"}</td>

                  <td>{record?.totalHours || "-"}</td>

                  <td>
                    <span
                      className={`status-badge ${
                        record?.status === "Present" ? "success" : record?.status === "Leave" ? "warning" : "danger"
                      }`}
                    >
                      {record?.status || "Absent"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}

export default AdminAttendance;