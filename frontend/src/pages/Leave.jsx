import { useState } from "react";
import Layout from "../components/layout/Layout";

import { useAuth } from "../context/AuthContext";

import { getActivities, getLeaveRequests, saveActivities, saveLeaveRequests } from "../utils/storage";

function Leave() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    type: "Paid",
    startDate: "",
    endDate: "",
    remarks: "",
  });

  const [message, setMessage] = useState("");

  const requests = getLeaveRequests().filter((item) => item.employeeId === user.id);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.startDate || !form.endDate || !form.remarks) {
      setMessage("Please complete all leave fields.");
      return;
    }

    const allRequests = getLeaveRequests();

    const request = {
      id: `LR${Date.now()}`,
      employeeId: user.id,
      employeeName: user.name,
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      remarks: form.remarks,
      status: "Pending",
      hrComment: "",
    };

    saveLeaveRequests([...allRequests, request]);

    const activities = getActivities();

    saveActivities([
      {
        id: Date.now(),
        employeeId: user.id,
        title: "Leave request submitted",
        description: `${form.type} leave from ${form.startDate} to ${form.endDate}`,
      },
      ...activities,
    ]);

    setForm({
      type: "Paid",
      startDate: "",
      endDate: "",
      remarks: "",
    });

    setMessage("Leave request submitted successfully.");

    setTimeout(() => {
      window.location.reload();
    }, 700);
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Leave</h1>

          <p>Manage your leave requests.</p>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}

      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>Leave Balance</h2>

            <p>Your current leave balance.</p>
          </div>
        </div>

        <div className="leave-balance-grid">
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
            <strong>{requests.filter((item) => item.status === "Pending").length}</strong>
          </div>
        </div>
      </section>

      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>Leave Types</h2>

            <p>Available leave categories.</p>
          </div>
        </div>

        <div className="leave-type-grid">
          <div>
            <strong>Paid</strong>
            <span>12 Days</span>
          </div>

          <div>
            <strong>Sick</strong>
            <span>06 Days</span>
          </div>

          <div>
            <strong>Unpaid</strong>
            <span>As required</span>
          </div>
        </div>
      </section>

      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>Apply for Leave</h2>

            <p>Submit a new leave request.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Leave Type</label>

              <select value={form.type} onChange={(e) => updateField("type", e.target.value)}>
                <option value="Paid">Paid</option>
                <option value="Sick">Sick</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            <div className="field">
              <label>Start Date</label>

              <input type="date" value={form.startDate} onChange={(e) => updateField("startDate", e.target.value)} />
            </div>

            <div className="field">
              <label>End Date</label>

              <input type="date" value={form.endDate} onChange={(e) => updateField("endDate", e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Remarks</label>

            <textarea
              value={form.remarks}
              placeholder="Enter reason for leave..."
              onChange={(e) => updateField("remarks", e.target.value)}
            />
          </div>

          <button className="primary-button">Submit Leave Request</button>
        </form>
      </section>

      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>Request History</h2>

            <p>Track your leave requests.</p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="empty-state">No leave requests found.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>HR Comment</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.type}</td>

                    <td>
                      {request.startDate} → {request.endDate}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          request.status === "Approved"
                            ? "success"
                            : request.status === "Rejected"
                            ? "danger"
                            : "warning"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td>{request.hrComment || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Layout>
  );
}

export default Leave;