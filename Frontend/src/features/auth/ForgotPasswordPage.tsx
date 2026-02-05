import { Link } from "react-router-dom";
import "./AuthPages.css";
import Background from "@components/Background/Background";
import { useForgotPassword } from "@/hooks/auth";

const ForgotPasswordPage: React.FC = () => {
  const {
    email,
    isLoading,
    error,
    handleEmailSubmit,
    handleEmailChange,
  } = useForgotPassword();

  return (
    <div className="auth-container">
      <Background />
      <div className="register_auth-card forgot-password-card">
        <div className="auth-header">
          <div className="logo">
            <div className="logo-icon">D</div>
            <h2>DEVIEW</h2>
          </div>
        </div>
        <div className="auth-content">
          <div className="auth-form-section">
            <div className="back-link">
              <Link to="/login" className="back-button">
                ← Back to Login
              </Link>
            </div>
            <div className="forgot-password-content">
              <h1 className="forgot-title">Forgot Password?</h1>
              <p className="forgot-message">
                No worries! Enter your email address and we'll send you an OTP to reset your password.
              </p>
              <form onSubmit={handleEmailSubmit} className="auth-form">
                <div className="form-group">
                  <div className="input-wrapper">
                    <span className="input-icon">@</span>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={handleEmailChange}
                      className={error ? "error" : ""}
                    />
                  </div>
                  {error && <span className="error-message">{error}</span>}
                </div>
                <button type="submit" className="submit-btn forgot-btn" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            </div>
            <div className="mobile-auth-links">
              <span>Remembered your password? </span>
              <Link to="/login">Sign in</Link>
            </div>
          </div>
          <div className="auth-welcome-section">
            <div className="welcome-graphic"></div>
            <h1 className="welcome-title">Reset Password.</h1>
            <p className="welcome-text">
              Don't worry if you've forgotten your password. We'll help you create a new one quickly and securely.
            </p>
            <div className="reset-tips">
              <div className="tip-item">
                <div className="tip-icon icon-shield"></div>
                <span>Secure OTP verification</span>
              </div>
              <div className="tip-item">
                <div className="tip-icon icon-bolt"></div>
                <span>Quick and easy process</span>
              </div>
              <div className="tip-item">
                <div className="tip-icon">@</div>
                <span>Email verification required</span>
              </div>
            </div>
            <div className="login-link">
              <span>Remembered your password? </span>
              <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
