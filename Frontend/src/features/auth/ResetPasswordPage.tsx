import { Link } from "react-router-dom";
import "./AuthPages.css";
import Background from "@components/Background/Background";
import { useResetPassword } from "@/hooks/auth/useResetPassword";

const ResetPasswordPage: React.FC = () => {
  const {
    formData,
    showNewPassword,
    showConfirmPassword,
    isLoading,
    isSuccess,
    errors,
    paramError,
    handleInputChange,
    handleSubmit,
    toggleNewPasswordVisibility,
    toggleConfirmPasswordVisibility,
  } = useResetPassword();

  return (
    <div className="auth-container">
      <Background />
      <div className="register_auth-card reset-password-card">
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
            {paramError && (
              <div className="reset-password-content">
                <h1 className="reset-title">Session Expired</h1>
                <p className="error-message" style={{ color: '#e74c3c', marginBottom: '20px' }}>
                  {paramError}
                </p>
                <Link to="/forgot-password" className="submit-btn reset-btn" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                  Go to Forgot Password
                </Link>
              </div>
            )}
            {!isSuccess && !paramError ? (
              <div className="reset-password-content">
                <h1 className="reset-title">Reset Password</h1>
                <p className="reset-message">
                  Enter your new password below. Make sure it's secure and easy to remember.
                </p>
                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="form-group">
                    <div className="input-wrapper">
                      <span className="input-icon icon-lock"></span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        placeholder="New Password"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className={errors.newPassword ? "error" : ""}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={toggleNewPasswordVisibility}
                      >
                        {showNewPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
                  </div>
                  <div className="form-group">
                    <div className="input-wrapper">
                      <span className="input-icon icon-lock"></span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm New Password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={errors.confirmPassword ? "error" : ""}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                  </div>
                  <button type="submit" className="submit-btn reset-btn" disabled={isLoading}>
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              </div>
            ) : isSuccess ? (
              <div className="success-content">
                <div className="success-icon icon-check"></div>
                <h2 className="success-title">Password Reset Successfully!</h2>
                <p className="success-message">
                  Your password has been updated. You can now log in with your new password.
                </p>
                <div className="success-actions">
                  <Link to="/login" className="login-btn">
                    Continue to Login
                  </Link>
                </div>
              </div>
            ) : null}
            <div className="mobile-auth-links">
              <span>Remembered your password? </span>
              <Link to="/login">Sign in</Link>
            </div>
          </div>
          <div className="auth-welcome-section">
            <div className="welcome-graphic"></div>
            <h1 className="welcome-title">New Password.</h1>
            <p className="welcome-text">
              Create a strong password to keep your account secure. Use a combination of letters, numbers, and special
              characters.
            </p>
            <div className="password-tips">
              <div className="tip-item">
                <div className="tip-icon icon-lock"></div>
                <span>At least 6 characters</span>
              </div>
              <div className="tip-item">
                <div className="tip-icon icon-text"></div>
                <span>Mix of letters and numbers</span>
              </div>
              <div className="tip-item">
                <div className="tip-icon icon-bolt"></div>
                <span>Unique and memorable</span>
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

export default ResetPasswordPage;
