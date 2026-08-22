import { useState } from "react";
import Layout from "../components/layout/Layout";

import { getLeaveRequests, saveLeaveRequests, getActivities, saveActivities } from "../utils/storage";

function LeaveApprovals() {
  const [requests, setRequests] = useState(getLeaveRequests());

  const [comments, setComments] = useState({});

  const updateComment = (id, value) => {
    setComments((previous) => ({
      ...previous,
      [id]: value,
    }));
  };

  const decide = (id, status) => {
    const comment = comments[id] || "";

    const updated = requests.map((request) =>
      request.id === id
        ? {
            ...request,
            status,
            hrComment: comment || (status === "Approved" ? "Approved by HR" : "Rejected by HR"),
          }
        : request
    );

    setRequests(updated);

    saveLeaveRequests(updated);

    const request = requests.find((item) => item.id === id);

    if (request) {
      const activities = getActivities();

      saveActivities([
        {
          id: Date.now(),
          employeeId: request.employeeId,
          title: `Leave ${status.toLowerCase()}`,
          description: comment || `HR ${status.toLowerCase()} the ${request.type} leave request.`,
        },
        ...activities,
      ]);
    }
  };

  const pending = requests.filter((item) => item.status === "Pending");

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Leave Approvals</h1>

          <p>Review and manage employee leave requests.</p>
        </div>

        <div className="approval-count">{pending.length} Pending</div>
      </div>

      <section className="content-card">
        {requests.length === 0 ? (
          <div className="empty-state">No leave requests found.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Remarks</th>
                  <th>Status</th>
                  <th>HR Comment</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong>{request.employeeName}</strong>
                      <small>{request.employeeId}</small>
                    </td>

                    <td>{request.type}</td>

                    <td>
                      {request.startDate} → {request.endDate}
                    </td>

                    <td>{request.remarks}</td>

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

                    <td>
                      {request.status === "Pending" ? (
                        <input
                          className="table-input"
                          placeholder="Optional comment"
                          value={comments[request.id] || ""}
                          onChange={(e) => updateComment(request.id, e.target.value)}
                        />
                      ) : (
                        request.hrComment || "-"
                      )}
                    </td>

                    <td>
                      {request.status === "Pending" ? (
                        <div className="action-buttons">
                          <button className="approve-button" onClick={() => decide(request.id, "Approved")}>Approve</button>

                          <button className="reject-button" onClick={() => decide(request.id, "Rejected")}>Reject</button>
                        </div>
                      ) : (
                        <span>Completed</span>
                      )}
                    </td>
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

export default LeaveApprovals;