import React from "react";
import { Link } from "react-router-dom";
import "./AuthPages.css";
import Background from "@components/Background/Background";
import { useLogin } from "@/hooks/auth/useLogin";
import { useGoogleAuth } from "@/hooks/auth/useGoogleAuth";

const LoginPage: React.FC = () => {
  // Get everything from hooks - no local state needed!
  const {
    formData,
    showPassword,
    isLoading,
    serverError,
    validationError,
    handleInputChange,
    handleSubmit,
    togglePasswordVisibility,
  } = useLogin();

  const { initiateGoogleAuth, loading: googleLoading, error: googleError } = useGoogleAuth();

  // Combined error display (validation errors take priority)
  const errorToShow = validationError || serverError || googleError;

  return (
    <div className="auth-container">
      <Background />
      <div className="login_auth-card">
        <div className="auth-header">
          <div className="logo">
            <div className="logo-icon">D</div>
            <h2>DEVIEW</h2>
          </div>
        </div>
        <div className="auth-content">
          <div className="auth-form-section">
            <div className="user-avatar">D</div>
            {errorToShow && <div className="error-message">{errorToShow}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <div className="input-wrapper">
                  <span className="input-icon">@</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoComplete="email"
                  />
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
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div className="form-options">
                <Link to="/forgot-password" className="forgot-link">
                  Forgot your password?
                </Link>
              </div>




              <button type="submit" className="submit-btn login-btn" disabled={isLoading || googleLoading}>
                {isLoading ? "Logging in..." : "LOGIN"}
              </button>

              <div className="divider">
                <span>OR</span>
              </div>

              <button
                type="button"
                onClick={() => initiateGoogleAuth()}
                className="google-login-btn"
                disabled={isLoading || googleLoading}
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
            </form>
            <div className="mobile-auth-links">
              <span>New here? </span>
              <Link to="/register">Sign up</Link>
            </div>
          </div>
          <div className="auth-welcome-section">
            <div className="welcome-graphic"></div>
            <h1 className="welcome-title">Welcome.</h1>
            <p className="welcome-text">
              Sign in to access your account and manage your profile. Stay connected with the latest updates and
              opportunities.
            </p>
            <div className="signup-link">
              <span>New here? </span>
              <Link to="/register">Sign up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
