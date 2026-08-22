import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "employee",
  });

  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const passwordValid = form.password.length >= 8 && /\d/.test(form.password) && /[^A-Za-z0-9]/.test(form.password);

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    if (!passwordValid) {
      setError("Password must be at least 8 characters and contain a number and symbol.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = signup(form);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
  };

  return (
    <div className="auth-page">
      <div className="auth-card signup-card">
        <div className="auth-logo">D</div>

        <h1>Create Account</h1>

        <p className="auth-subtitle">Join Dayflow</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Employee ID</label>

            <input
              value={form.employeeId}
              placeholder="Leave blank to auto-generate"
              onChange={(e) => updateField("employeeId", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Full Name</label>

            <input
              value={form.name}
              placeholder="Enter your name"
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={form.email}
              placeholder="Enter email"
              onChange={(e) => updateField("email", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>

            <select value={form.role} onChange={(e) => updateField("role", e.target.value)}>
              <option value="employee">Employee</option>
              <option value="hr">HR / Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              value={form.password}
              placeholder="Create password"
              onChange={(e) => updateField("password", e.target.value)}
              required
            />

            <small className={passwordValid ? "validation-success" : "validation-text"}>
              Minimum 8 characters, one number, one symbol
            </small>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>

            <input
              type="password"
              value={form.confirmPassword}
              placeholder="Confirm password"
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              required
            />
          </div>

          <button className="primary-button full-width">Create Account</button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;