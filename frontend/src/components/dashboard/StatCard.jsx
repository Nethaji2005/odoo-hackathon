function StatCard({
  title,
  value,
  description,
  icon,
  color = "blue",
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        {icon}
      </div>

      <div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-description">
          {description}
        </div>
      </div>
    </div>
  );
}

export default StatCard;