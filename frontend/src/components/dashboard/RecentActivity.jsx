function RecentActivity() {
  return (
    <div className="activity-card">
      <div className="card-header">
        <div>
          <h2>Recent Activity</h2>
          <p>Your latest activity</p>
        </div>
      </div>

      <div className="activity-list">
        <div className="activity-item">
          <div className="activity-icon">✓</div>

          <div>
            <div className="activity-title">
              Attendance marked
            </div>

            <div className="activity-time">
              Today at 09:00 AM
            </div>
          </div>
        </div>

        <div className="activity-item">
          <div className="activity-icon">□</div>

          <div>
            <div className="activity-title">
              Leave request submitted
            </div>

            <div className="activity-time">
              Yesterday at 04:30 PM
            </div>
          </div>
        </div>

        <div className="activity-item">
          <div className="activity-icon">◎</div>

          <div>
            <div className="activity-title">
              Profile updated
            </div>

            <div className="activity-time">
              2 days ago
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecentActivity;