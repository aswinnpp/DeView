import { Link } from "react-router-dom";
import Background from "@components/Background/Background";
import { useResetPassword } from "@/hooks/auth/useResetPassword";
import { Input, Button } from "../../components/common";
import { useState ,useCallback } from "react";

const inputWrapperBase = "relative flex items-center bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl p-3.5 transition-all duration-300 focus-within:border-brand-primary focus-within:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]";
const inputClass = "bg-transparent border-none text-white text-sm w-full outline-none placeholder:text-[rgba(255,255,255,0.5)]";
const passwordIconClass = "text-[rgba(255,255,255,0.6)] mr-3 shrink-0 text-[10px] min-w-5 flex items-center justify-center before:content-['⬤'] before:bg-linear-to-br before:from-brand-primary before:to-brand-secondary before:bg-clip-text before:text-transparent";
const toggleClass = "bg-none border-none text-[rgba(255,255,255,0.6)] cursor-pointer p-1 rounded transition-colors duration-300 hover:text-white text-xs min-w-10";
const errorMsgClass = "text-brand-red text-sm mt-0.5 whitespace-nowrap block";

const ResetPasswordPage = () => {
   const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

     const toggleNewPasswordVisibility = useCallback(() => setShowNewPassword(prev => !prev), []);
      const toggleConfirmPasswordVisibility = useCallback(() => setShowConfirmPassword(prev => !prev), []);
  const {
    isLoading,
    error,
    data,
  } = useResetPassword();
  const { form, onSubmit,   } = data;
  const { register, handleSubmit, formState } = form;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-center">
      <Background />
      <div className="bg-[rgba(15,15,25,0.95)] rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] w-full max-w-[960px] min-h-[600px] overflow-hidden relative flex flex-col max-md:rounded-2xl max-sm:rounded-xl max-sm:min-h-[520px]">
        {/* Header */}
        <div className="py-5 px-7 border-b border-[rgba(255,255,255,0.1)] flex justify-between items-center max-md:py-4 max-md:px-5">
          <div className="flex items-center gap-3">
            <h2 className="text-white text-lg font-semibold tracking-wider">DEVIEW</h2>
          </div>
        </div>
        {/* Content */}
        <div className="grid grid-cols-1 min-[680px]:grid-cols-[1fr_1.2fr] flex-1">
          {/* Form Section */}
          <div className="py-8 px-8 flex flex-col justify-center relative text-center max-sm:py-6 max-sm:px-5">
            {error && (
              <div>
                <h1 className="text-white text-xl font-bold mb-2">Session Expired</h1>
                <p className="text-brand-red text-sm mb-5">{error}</p>
                <Link to="/forgot-password" className="block w-full p-3.5 border-none rounded-xl text-sm font-semibold no-underline text-center bg-linear-to-br from-brand-indigo to-brand-indigo-dark text-white">
                  Go to Forgot Password
                </Link>
              </div>
            )}
            {!error ? (
              <div>
                <h1 className="text-white text-xl font-bold mb-2">Reset Password</h1>
                <p className="text-[rgba(255,255,255,0.7)] text-sm leading-relaxed mb-5">
                  Enter your new password below. Make sure it's secure and easy to remember.
                </p>
                {error && <p className="text-brand-red text-sm mb-3">{error}</p>}
                <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                  {/* New Password */}
                  <div className="mb-3.5">
                    <div className={inputWrapperBase}>
                      <span className={passwordIconClass}></span>
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="New Password"
                        className={inputClass}
                        {...register("newPassword")}
                      />
                      <Button type="button" variant="secondary" className={`${toggleClass} !bg-none !text-[rgba(255,255,255,0.6)]`} onClick={toggleNewPasswordVisibility}>
                        {showNewPassword ? "Hide" : "Show"}
                      </Button>
                    </div>
                    {formState.errors.newPassword?.message && (
                      <span className={errorMsgClass}>{formState.errors.newPassword.message}</span>
                    )}
                  </div>
                  {/* Confirm Password */}
                  <div className="mb-3.5">
                    <div className={inputWrapperBase}>
                      <span className={passwordIconClass}></span>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm New Password"
                        className={inputClass}
                        {...register("confirmPassword")}
                      />
                      <Button type="button" variant="secondary" className={`${toggleClass} !bg-none !text-[rgba(255,255,255,0.6)]`} onClick={toggleConfirmPasswordVisibility}>
                        {showConfirmPassword ? "Hide" : "Show"}
                      </Button>
                    </div>
                    {formState.errors.confirmPassword?.message && (
                      <span className={errorMsgClass}>{formState.errors.confirmPassword.message}</span>
                    )}
                  </div>
                  <Button type="submit" variant="primary" className="w-full p-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading}>
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </div>
            ) : null}
            <div className="hidden max-[679px]:block text-center mt-5 text-[rgba(255,255,255,0.7)] text-sm">
              <span>Remembered your password? </span>
              <Link to="/login" className="text-brand-blue no-underline font-semibold">Sign in</Link>
            </div>
          </div>
          {/* Welcome Section */}
          <div className="hidden min-[680px]:flex bg-linear-to-br from-[rgba(102,126,234,0.1)] to-[rgba(118,75,162,0.1)] py-8 px-8 flex-col justify-center relative overflow-hidden text-center">
            <h1 className="text-white text-4xl font-bold mb-3 relative z-[1]">New Password.</h1>
            <p className="text-[rgba(255,255,255,0.8)] text-sm leading-relaxed mb-6 relative z-[1]">
              Create a strong password to keep your account secure. Use a combination of letters, numbers, and special
              characters.
            </p>
            <div className="flex flex-col gap-3.5 relative z-[1]">
              {[
                { icon: "🔒", text: "At least 8 characters" },
                { icon: "Aa", text: "Include uppercase and lowercase letters" },
                { icon: "#1", text: "Include a number and a special character" },
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-3 text-[rgba(255,255,255,0.8)] text-sm">
                  <div className="w-6 h-6 bg-[rgba(255,255,255,0.1)] rounded-md flex items-center justify-center text-xs shrink-0">{tip.icon}</div>
                  <span>{tip.text}</span>
                </div>
              ))}
              <div className="text-center mt-4 text-[rgba(255,255,255,0.7)] text-sm">
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

export default ResetPasswordPage;
