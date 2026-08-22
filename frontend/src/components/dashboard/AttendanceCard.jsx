import { useNavigate } from "react-router-dom";

function AttendanceCard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div>
          <h2>Today's Attendance</h2>
          <p>Your attendance information</p>
        </div>

        <span className="status-badge">
          Present
        </span>
      </div>

      <div className="info-grid">
        <div className="info-box">
          <span>Check In</span>
          <strong>09:00 AM</strong>
        </div>

        <div className="info-box">
          <span>Check Out</span>
          <strong>06:00 PM</strong>
        </div>

        <div className="info-box">
          <span>Total Hours</span>
          <strong>08:00</strong>
        </div>
      </div>

      <button
        className="action-button"
        onClick={() => navigate("/attendance")}
      >
        View Attendance
      </button>
    </div>
  );
}

export default AttendanceCard;