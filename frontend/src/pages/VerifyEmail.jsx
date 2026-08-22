import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { verifyEmail } = useAuth();

  const email = searchParams.get("email") || "";

  const [message, setMessage] = useState("");

  const handleVerify = () => {
    verifyEmail(email);

    setMessage("Email verified successfully. You can now login.");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="verification-icon">✓</div>

        <h1>Verify Email</h1>

        <p className="auth-subtitle">A verification email has been sent to:</p>

        <strong className="verification-email">{email}</strong>

        <p className="verification-text">
          For this hackathon demo, click the button below to simulate email verification.
        </p>

        {message && <div className="success-message">{message}</div>}

        {!message ? (
          <button className="primary-button full-width" onClick={handleVerify}>
            Verify Email
          </button>
        ) : (
          <button className="primary-button full-width" onClick={() => navigate("/login")}>
            Go to Login
          </button>
        )}

        <p className="auth-footer">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;