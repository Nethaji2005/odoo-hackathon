import { useNavigate } from "react-router-dom";

function LeaveCard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div>
          <h2>Leave Summary</h2>
          <p>Your current leave information</p>
        </div>
      </div>

      <div className="leave-summary">
        <div className="leave-item">
          <span>Available</span>
          <strong>12</strong>
        </div>

        <div className="leave-item">
          <span>Used</span>
          <strong>06</strong>
        </div>

        <div className="leave-item">
          <span>Pending</span>
          <strong>01</strong>
        </div>
      </div>

      <button
        className="secondary-button"
        onClick={() => navigate("/leave")}
      >
        Manage Leave
      </button>
    </div>
  );
}

export default LeaveCard;