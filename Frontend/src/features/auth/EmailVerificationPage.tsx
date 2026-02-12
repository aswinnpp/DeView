import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Background from "@components/Background/Background";
import { useEmailVerification } from "@/hooks/auth/useEmailVerification";
import { Input, Button } from "../../components/common";



const EmailVerificationPage = () => {

  const {
    isLoading,
    error,
    data,
  } = useEmailVerification();
  const { form, mode, userEmail, handleResendOtp, onSubmit } = data;
  const { register, handleSubmit, formState, watch } = form;

  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [countdown]);

  const onResendClick = async () => {
    if (isLoading || countdown > 0) return;

    const success = await handleResendOtp();
    if (success) {
      setCountdown(60);
    }
  };

  const isPasswordReset = mode === "password-reset";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-center">
      <Background />
      <div className="bg-[rgba(15,15,25,0.95)] rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] w-full max-w-[960px] min-h-[600px] overflow-hidden relative flex flex-col max-md:rounded-2xl max-sm:rounded-xl max-sm:min-h-[520px]">
        {/* Header */}
        <div className="py-5 px-7 border-b border-[rgba(255,255,255,0.1)] flex justify-between items-center max-md:py-4 max-md:px-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center text-white">D</div>
            <h2 className="text-white text-lg font-semibold tracking-wider">DEVIEW</h2>
          </div>
        </div>
        {/* Content */}
        <div className="grid grid-cols-1 min-[680px]:grid-cols-[1fr_1.2fr] flex-1">
          {/* Form Section */}
          <div className="py-8 px-8 flex flex-col justify-center relative text-center max-sm:py-6 max-sm:px-5">
            <div>
              <h1 className="text-white text-xl font-bold mb-2">
                {isPasswordReset ? "Verify Your Email" : "Check Your Email"}
              </h1>
              <p className="text-[rgba(255,255,255,0.7)] text-sm leading-relaxed mb-5">
                {isPasswordReset
                  ? `We've sent a 4-digit OTP to ${userEmail || "your email"}. Enter it below to reset your password.`
                  : `We've sent a verification code to ${userEmail || "your email"}. Please enter the 4-digit OTP below to verify your account.`}
              </p>

              <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="Enter 4-digit OTP"
                  maxLength={4}
                  {...register("otpCode")}
                  className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl p-3.5 text-white text-center text-2xl tracking-[10px] w-full outline-none transition-all duration-300 focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)] placeholder:text-[rgba(255,255,255,0.4)] placeholder:text-sm placeholder:tracking-normal"
                  aria-label="4-digit OTP"
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full p-3.5 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isLoading || (watch("otpCode")?.length ?? 0) !== 4}
                  aria-disabled={isLoading || (watch("otpCode")?.length ?? 0) !== 4}
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>

                <span
                  onClick={onResendClick}
                  className={`text-brand-blue underline text-sm ${isLoading || countdown > 0 ? "cursor-not-allowed opacity-60" : "cursor-pointer opacity-100"}`}
                >
                  {isLoading
                    ? "Resending..."
                    : countdown > 0
                      ? `Resend OTP (${countdown}s)`
                      : "Resend OTP"}
                </span>

                {(error || formState.errors.otpCode?.message) && (
                  <div className="text-brand-red text-sm">
                    {error || formState.errors.otpCode?.message}
                  </div>
                )}
              </form>
            </div>

            <div className="hidden max-[679px]:block text-center mt-5 text-[rgba(255,255,255,0.7)] text-sm">
              <span>Remembered your password? </span>
              <Link to="/login" className="text-brand-blue no-underline font-semibold">Sign in</Link>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="hidden min-[680px]:flex bg-linear-to-br from-[rgba(102,126,234,0.1)] to-[rgba(118,75,162,0.1)] py-8 px-8 flex-col justify-center relative overflow-hidden text-center">
            <h1 className="text-white text-4xl font-bold mb-3 relative z-[1]">
              {isPasswordReset ? "Reset Password." : "Almost There!"}
            </h1>
            <p className="text-[rgba(255,255,255,0.8)] text-sm leading-relaxed mb-6 relative z-[1]">
              {isPasswordReset
                ? "Enter the OTP sent to your email to proceed with resetting your password."
                : "Your account is almost ready. Just one more step to complete your registration and start exploring our platform."}
            </p>
            <div className="flex flex-col gap-3.5 relative z-[1]">
              {[
                { icon: "@", text: "Check your spam folder" },
                { icon: "⏱", text: "OTP valid for 1 minute" },
                { icon: "🔒", text: "Secure verification process" },
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-3 text-[rgba(255,255,255,0.8)] text-sm">
                  <div className="w-6 h-6 bg-[rgba(255,255,255,0.1)] rounded-md flex items-center justify-center text-xs shrink-0">{tip.icon}</div>
                  <span>{tip.text}</span>
                </div>
              ))}
              <div className="text-center mt-3 text-[rgba(255,255,255,0.7)] text-sm">
                <span>Remembered your password? </span>
                <Link to="/login" className="text-brand-blue no-underline font-semibold">Sign in</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
