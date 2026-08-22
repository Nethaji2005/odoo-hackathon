function EmptyState({
  title = "No data found",
  message = "There is nothing to display.",
}) {
  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
        color: "#718096",
      }}
    >
      <h3
        style={{
          margin: "0 0 8px",
          color: "#102a43",
        }}
      >
        {title}
      </h3>

      <p style={{ margin: 0 }}>
        {message}
      </p>
    </div>
  );
}

export default EmptyState;