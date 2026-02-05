import React from "react";
import { Link } from "react-router-dom";
import "./AuthPages.css";
import Background from "@components/Background/Background";
import { useRegister, useGoogleAuth } from "@/hooks/auth";

const RegisterPage: React.FC = () => {
  // Get everything from hooks - no local state needed!
  const {
    selectedRole,
    handleRolePick,
    formData,
    errors,
    showPassword,
    showConfirmPassword,
    loading,
    apiLoading,
    serverError,
    handleInputChange,
    handleSubmit,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
  } = useRegister();

  const { initiateGoogleAuth, loading: googleLoading, error: googleError } = useGoogleAuth();

  // Handle Google registration with role
  const handleGoogleRegister = () => {
    if (!selectedRole) return;
    sessionStorage.setItem("pendingRole", selectedRole);
    initiateGoogleAuth(selectedRole);
  };

  // Combined error
  const reduxError = serverError || googleError;

  return (
    <div className="auth-container">
      <Background />

      <div className="register_auth-card">
        <div className="auth-header">
          <div className="logo">
            <div className="logo-icon">D</div>
            <h2>DEVIEW</h2>
          </div>
        </div>

        <div className="auth-content">
          <div className="auth-form-section">
            <div className="user-avatar">D</div>

            {serverError && <p className="error-message">{serverError}</p>}
            {reduxError && !serverError && <p className="error-message">{reduxError}</p>}

            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <button
                type="button"
                onClick={() => handleRolePick("candidate")}
                className={`pill-button ${selectedRole === "candidate" ? "active" : ""}`}
                style={{ flex: 1 }}
              >
                Candidate
              </button>

              <button
                type="button"
                onClick={() => handleRolePick("company")}
                className={`pill-button ${selectedRole === "company" ? "active" : ""}`}
                style={{ flex: 1 }}
              >
                Company
              </button>
            </div>

            {selectedRole && (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <div className="input-wrapper">
                    <span className="input-icon icon-user"></span>
                    <input
                      type="text"
                      name="fullName"
                      placeholder={selectedRole === "company" ? "Company Name" : "Full Name"}
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={errors.fullName ? "error" : ""}
                    />
                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <span className="input-icon">@</span>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? "error" : ""}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <span className="input-icon icon-lock"></span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={errors.password ? "error" : ""}
                    />
                    {!errors.password && (
                      <button type="button" className="password-toggle" onClick={togglePasswordVisibility}>
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <span className="input-icon icon-lock"></span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={errors.confirmPassword ? "error" : ""}
                    />
                    {!errors.confirmPassword && (
                      <button type="button" className="password-toggle" onClick={toggleConfirmPasswordVisibility}>
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    )}
                  </div>
                </div>

                <button type="submit" className="submit-btn register-btn" disabled={loading || apiLoading}>
                  {loading || apiLoading ? "Creating Account..." : "REGISTER"}
                </button>

                {/* Google Auth for Mobile - Only shows on mobile */}
                <div className="mobile-google-auth">
                  <div className="divider">
                    <span>OR</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleRegister}
                    className="google-login-btn"
                    disabled={loading || apiLoading || googleLoading}
                  >
                    <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {googleLoading ? "Connecting..." : "Continue with Google"}
                  </button>
                </div>
              </form>
            )}

            <div className="mobile-auth-links">
              <span>Already have an account? </span>
              <Link to="/login">Sign in</Link>
            </div>
          </div>

          <div className="auth-welcome-section">
            <div className="welcome-graphic"></div>
            <h1 className="welcome-title">Join Us.</h1>
            <p className="welcome-text">Create your account to get started.</p>

            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <span>Free account creation</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <span>Secure authentication</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <span>24/7 support</span>
              </div>

              {selectedRole && (
                <>
                  <div className="divider" style={{ margin: "24px 0" }}>
                    <span>OR</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleRegister}
                    className="google-login-btn"
                    disabled={loading || apiLoading || googleLoading}
                  >
                    <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {googleLoading ? "Connecting..." : "Continue with Google"}
                  </button>
                </>
              )}

              <div className="login-link">
                <span>Already have an account? </span>
                <Link to="/login">Sign in</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RegisterPage);
