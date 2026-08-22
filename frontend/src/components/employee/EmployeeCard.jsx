function EmployeeCard({ employee }) {
  return (
    <div className="content-card">
      <div className="profile-avatar">
        {employee.name?.charAt(0) || "E"}
      </div>

      <h3
        style={{
          margin: "0 0 5px",
          color: "#102a43",
          textAlign: "center",
        }}
      >
        {employee.name}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#718096",
          textAlign: "center",
        }}
      >
        {employee.role}
      </p>
    </div>
  );
}

export default EmployeeCard;