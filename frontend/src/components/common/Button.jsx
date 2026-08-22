function Button({
  children,
  type = "button",
  className = "",
  onClick,
}) {
  return (
    <button
      type={type}
      className={`action-button ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;