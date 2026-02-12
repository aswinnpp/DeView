import { Link } from "react-router-dom";
import Background from "@components/Background/Background";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { Input, Button } from "../../components/common";

const inputWrapperBase = "relative flex items-center bg-[rgba(255,255,255,0.05)] border rounded-xl p-3.5 transition-all duration-300 focus-within:border-brand-primary focus-within:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]";
const inputClass = "bg-transparent border-none text-white text-sm w-full outline-none placeholder:text-[rgba(255,255,255,0.5)]";
const iconClass = "text-[rgba(255,255,255,0.6)] mr-3 shrink-0 text-base min-w-5 flex items-center justify-center";

const ForgotPasswordPage = () => {
  const {
    isLoading,
    error,
    data,
  } = useForgotPassword();
  const { form, onSubmit } = data;
  const { register, handleSubmit, formState } = form;

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
              <h1 className="text-white text-xl font-bold mb-2">Forgot Password?</h1>
              <p className="text-[rgba(255,255,255,0.7)] text-sm leading-relaxed mb-5">
                No worries! Enter your email address and we'll send you an OTP to reset your password.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className="mb-3.5">
                  <div className={`${inputWrapperBase} ${error ? "border-brand-red" : "border-[rgba(255,255,255,0.1)]"}`}>
                    <span className={iconClass}>@</span>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className={inputClass}
                      {...register("email")}
                    />
                  </div>
                  {(error || formState.errors.email?.message) && (
                    <span className="text-brand-red text-sm mt-0.5 block">
                      {error || formState.errors.email?.message}
                    </span>
                  )}
                </div>
                <Button type="submit" variant="primary" className="w-full p-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            </div>
            <div className="hidden max-[679px]:block text-center mt-5 text-[rgba(255,255,255,0.7)] text-sm">
              <span>Remembered your password? </span>
              <Link to="/login" className="text-brand-blue no-underline font-semibold">Sign in</Link>
            </div>
          </div>
          {/* Welcome Section */}
          <div className="hidden min-[680px]:flex bg-linear-to-br from-[rgba(102,126,234,0.1)] to-[rgba(118,75,162,0.1)] py-8 px-8 flex-col justify-center relative overflow-hidden text-center">
            <h1 className="text-white text-4xl font-bold mb-3 relative z-[1]">Reset Password.</h1>
            <p className="text-[rgba(255,255,255,0.8)] text-sm leading-relaxed mb-6 relative z-[1]">
              Don't worry if you've forgotten your password. We'll help you create a new one quickly and securely.
            </p>
            <div className="flex flex-col gap-3.5 relative z-[1]">
              {[
                { icon: "🛡️", text: "Secure OTP verification" },
                { icon: "⚡", text: "Quick and easy process" },
                { icon: "@", text: "Email verification required" },
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

export default ForgotPasswordPage;
