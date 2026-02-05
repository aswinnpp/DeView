import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AuthPages.css";
import Background from "@components/Background/Background";
import { useEmailVerification } from "@/hooks/auth";

interface IEmailVerificationPageProps {
  email?: string;
}

const EmailVerificationPage: React.FC<IEmailVerificationPageProps> = ({ email = "" }) => {
  const {
    otpCode,
    successMessage,
    errorMessage,
    mode,
    userEmail,
    isVerifying,
    isResending,
    handleVerifyOtp,
    handleResendOtp,
    handleOtpChange,
  } = useEmailVerification(email);

  // Countdown timer - managed directly in UI
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [countdown]);

  // Handle resend with countdown reset
  const onResendClick = async () => {
    if (isResending || countdown > 0) return;

    const success = await handleResendOtp();
    if (success) {
      setCountdown(60);
    }
  };

  const isPasswordReset = mode === "password-reset";

  return (
    <div className="auth-container">
      <Background />
      <div className="register_auth-card verification-card">
        <div className="auth-header">
          <div className="logo">
            <div className="logo-icon">D</div>
            <h2>DEVIEW</h2>
          </div>
        </div>
        <div className="auth-content">
          <div className="auth-form-section">
            <div className="verification-icon icon-check"></div>
            <div className="verification-content">
              <h1 className="verification-title">
                {isPasswordReset ? "Verify Your Email" : "Check Your Email"}
              </h1>
              <p className="verification-message">
                {isPasswordReset
                  ? `We've sent a 4-digit OTP to ${userEmail || "your email"}. Enter it below to reset your password.`
                  : `We've sent a verification code to ${userEmail || "your email"}. Please enter the 4-digit OTP below to verify your account.`}
              </p>

              <form className="otp-section" onSubmit={(e) => handleVerifyOtp(e)}>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="Enter 4-digit OTP"
                  value={otpCode}
                  maxLength={4}
                  onChange={handleOtpChange}
                  className="otp-input"
                  aria-label="4-digit OTP"
                />
                <button
                  type="submit"
                  className="verify-btn"
                  disabled={isVerifying || otpCode.length !== 4}
                  aria-disabled={isVerifying || otpCode.length !== 4}
                >
                  {isVerifying ? "Verifying..." : "Verify OTP"}
                </button>

                <span
                  onClick={onResendClick}
                  className="resend-link"
                  style={{
                    cursor: isResending || countdown > 0 ? "not-allowed" : "pointer",
                    color: "#4a90e2",
                    textDecoration: "underline",
                    opacity: isResending || countdown > 0 ? 0.6 : 1,
                    marginLeft: 12,
                  }}
                >
                  {isResending
                    ? "Resending..."
                    : countdown > 0
                      ? `Resend OTP (${countdown}s)`
                      : "Resend OTP"}
                </span>

                {successMessage && <div className="success-message">{successMessage}</div>}
                {errorMessage && <div className="error-message">{errorMessage}</div>}
              </form>
            </div>

            <div className="mobile-auth-links" style={{ marginTop: 12 }}>
              <span>Remembered your password? </span>
              <Link to="/login">Sign in</Link>
            </div>
          </div>

          <div className="auth-welcome-section">
            <div className="welcome-graphic"></div>
            <h1 className="welcome-title">
              {isPasswordReset ? "Reset Password." : "Almost There!"}
            </h1>
            <p className="welcome-text">
              {isPasswordReset
                ? "Enter the OTP sent to your email to proceed with resetting your password."
                : "Your account is almost ready. Just one more step to complete your registration and start exploring our platform."}
            </p>
            <div className="verification-tips">
              <div className="tip-item">
                <div className="tip-icon">@</div>
                <span>Check your spam folder</span>
              </div>
              <div className="tip-item">
                <div className="tip-icon icon-clock"></div>
                <span>OTP valid for 10 minutes</span>
              </div>
              <div className="tip-item">
                <div className="tip-icon icon-lock"></div>
                <span>Secure verification process</span>
              </div>
            </div>
            <div className="login-link" style={{ marginTop: 12 }}>
              <span>Remembered your password? </span>
              <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
