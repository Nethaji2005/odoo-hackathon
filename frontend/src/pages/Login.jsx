import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const result = login(email, password);

    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/dashboard");
  };

  const fillEmployee = () => {
    setEmail("demo@dayflow.com");
    setPassword("demo123");
  };

  const fillAdmin = () => {
    setEmail("admin@dayflow.com");
    setPassword("admin123");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">D</div>

        <h1>Dayflow</h1>

        <p className="auth-subtitle">Employee Management System</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              value={password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="primary-button full-width" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="demo-box">
          <strong>Demo Accounts</strong>

          <button type="button" onClick={fillEmployee} className="demo-button">
            Employee Demo
          </button>

          <button type="button" onClick={fillAdmin} className="demo-button">
            Admin / HR Demo
          </button>
        </div>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;