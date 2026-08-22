function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  name,
}) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}

      <input
        className="form-input"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

export default Input;