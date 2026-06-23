import { memo, useState } from "react";
import { Link } from "react-router-dom";
import Background from "@components/Background/Background";
import { useRegister } from "@/hooks/auth/useRegister";
import { useGoogleAuth } from "@/hooks/auth/useGoogleAuth";
import { Input, Button } from "../../components/common";

const inputWrapperBase = "relative flex items-center bg-[rgba(255,255,255,0.05)] border rounded-xl p-3.5 transition-all duration-300 focus-within:border-brand-primary focus-within:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]";
const inputClass = "bg-transparent border-none text-white text-sm w-full outline-none placeholder:text-[rgba(255,255,255,0.5)]";
const iconBase = "text-[rgba(255,255,255,0.6)] mr-3 shrink-0 text-base min-w-5 flex items-center justify-center";
const passwordIconClass = "text-[rgba(255,255,255,0.6)] mr-3 shrink-0 text-base min-w-5 flex items-center justify-center text-[10px] before:content-['⬤'] before:bg-linear-to-br before:from-brand-primary before:to-brand-secondary before:bg-clip-text before:text-transparent";
const toggleClass = "bg-none border-none text-[rgba(255,255,255,0.6)] cursor-pointer p-1 rounded transition-colors duration-300 hover:text-white text-xs min-w-10";
const errorMsgClass = "text-brand-red text-sm mt-0.5 whitespace-nowrap block";

const GoogleIcon = () => (
  <svg className="shrink-0" viewBox="0 0 24 24" width="18" height="18">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const googleBtnClass = "w-full py-3 px-4 border border-[rgba(255,255,255,0.2)] rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 flex items-center justify-center gap-3 bg-[rgba(255,255,255,0.05)] text-white hover:not-disabled:bg-[rgba(255,255,255,0.1)] hover:not-disabled:border-[rgba(255,255,255,0.3)] hover:not-disabled:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none";

const RegisterPage = () => {
  const { isLoading, error, data } = useRegister();
  const { form, onSubmit } = data;
  const { register, handleSubmit, formState, watch, setValue } = form;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const selectedRole = watch("role");

  const google = useGoogleAuth();
  const { initiateGoogleAuth } = google.data;
  const googleLoading = google.isLoading;
  const googleError = google.error;

  const handleGoogleRegister = () => {
    if (!selectedRole) return;
    initiateGoogleAuth(selectedRole, "user");
  };

  const reduxError = error || googleError || formState.errors.root?.message;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-center">
      <Background />

      <div className="bg-[rgba(15,15,25,0.95)] rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] w-full max-w-[960px] min-h-[600px] overflow-hidden relative flex flex-col max-md:rounded-2xl max-sm:rounded-xl max-sm:min-h-[520px]">
        <div className="py-5 px-7 border-b border-[rgba(255,255,255,0.1)] flex justify-between items-center max-md:py-4 max-md:px-5">
          <div className="flex items-center gap-3">
            <h2 className="text-white text-lg font-semibold tracking-wider">DEVIEW</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 min-[680px]:grid-cols-[1fr_1.2fr] flex-1">
          <div className="py-6 px-8 flex flex-col justify-center relative text-center max-sm:py-5 max-sm:px-5">
            {reduxError && <p className="text-brand-red text-sm mt-0.5 whitespace-nowrap block">{reduxError}</p>}

            <div className="flex gap-2 mb-3">
              <Button
                type="button"
                variant={selectedRole === "candidate" ? "primary" : "secondary"}
                onClick={() => setValue("role", "candidate")}
                className={`flex-1 py-2.5 px-5 border-2 rounded-3xl text-sm font-semibold ${selectedRole !== "candidate" ? "!bg-[rgba(255,255,255,0.05)] !text-[rgba(255,255,255,0.7)] border-[rgba(255,255,255,0.2)]" : "border-brand-primary"}`}
              >
                Candidate
              </Button>
              <Button
                type="button"
                variant={selectedRole === "company" ? "primary" : "secondary"}
                onClick={() => setValue("role", "company")}
                className={`flex-1 py-2.5 px-5 border-2 rounded-3xl text-sm font-semibold ${selectedRole !== "company" ? "!bg-[rgba(255,255,255,0.05)] !text-[rgba(255,255,255,0.7)] border-[rgba(255,255,255,0.2)]" : "border-brand-primary"}`}
              >
                Company
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
              <div className="mb-3">
                <div className={`${inputWrapperBase} ${formState.errors.fullName ? "border-brand-red" : "border-[rgba(255,255,255,0.1)]"}`}>
                  <span className={`${iconBase} text-sm before:content-['●']`}></span>
                  <Input
                    type="text"
                    placeholder={selectedRole === "company" ? "Company Name" : "Full Name"}
                    className={inputClass}
                    {...register("fullName")}
                  />
                </div>
                {formState.errors.fullName?.message && <span className={errorMsgClass}>{formState.errors.fullName.message}</span>}
              </div>

              <div className="mb-3">
                <div className={`${inputWrapperBase} ${formState.errors.email ? "border-brand-red" : "border-[rgba(255,255,255,0.1)]"}`}>
                  <span className={iconBase}>@</span>
                  <Input
                    type="email"
                    placeholder="Email"
                    className={inputClass}
                    {...register("email")}
                  />
                </div>
                {formState.errors.email?.message && <span className={errorMsgClass}>{formState.errors.email.message}</span>}
              </div>

              <div className="mb-3">
                <div className={`${inputWrapperBase} ${formState.errors.password ? "border-brand-red" : "border-[rgba(255,255,255,0.1)]"}`}>
                  <span className={passwordIconClass}></span>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password (e.g. Abc@1234)"
                    className={inputClass}
                    {...register("password")}
                  />
                  <Button type="button" variant="secondary" className={`${toggleClass} !bg-none !text-[rgba(255,255,255,0.6)]`} onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </div>
                {formState.errors.password?.message && <span className={errorMsgClass}>{formState.errors.password.message}</span>}
              </div>

              <div className="mb-3">
                <div className={`${inputWrapperBase} ${formState.errors.confirmPassword ? "border-brand-red" : "border-[rgba(255,255,255,0.1)]"}`}>
                  <span className={passwordIconClass}></span>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className={inputClass}
                    {...register("confirmPassword")}
                  />
                  <Button type="button" variant="secondary" className={`${toggleClass} !bg-none !text-[rgba(255,255,255,0.6)]`} onClick={() => setShowConfirmPassword((prev) => !prev)}>
                    {showConfirmPassword ? "Hide" : "Show"}
                  </Button>
                </div>
                {formState.errors.confirmPassword?.message && (
                  <span className={errorMsgClass}>{formState.errors.confirmPassword.message}</span>
                )}
              </div>

              <Button type="submit" variant="primary" className="w-full p-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "REGISTER"}
              </Button>

              <div className="block mt-3 min-[680px]:hidden">
                <div className="flex items-center my-3 text-[rgba(255,255,255,0.5)] text-sm before:content-[''] before:flex-1 before:h-px before:bg-[rgba(255,255,255,0.1)] after:content-[''] after:flex-1 after:h-px after:bg-[rgba(255,255,255,0.1)]">
                  <span className="px-4">OR</span>
                </div>
                <Button type="button" variant="secondary" onClick={handleGoogleRegister} className={`${googleBtnClass} !bg-[rgba(255,255,255,0.05)] !text-white`} disabled={isLoading || googleLoading}>
                  <GoogleIcon />
                  {googleLoading ? "Connecting..." : "Continue with Google"}
                </Button>
              </div>
            </form>

            <div className="hidden max-[679px]:block text-center mt-4 text-[rgba(255,255,255,0.7)] text-sm">
              <span>Already have an account? </span>
              <Link to="/login" className="text-brand-blue no-underline font-semibold transition-colors duration-300 hover:text-[#5a67d8]">Sign in</Link>
            </div>
          </div>

          <div className="hidden min-[680px]:flex bg-linear-to-br from-[rgba(102,126,234,0.1)] to-[rgba(118,75,162,0.1)] py-8 px-8 flex-col justify-center relative overflow-hidden text-center">
            <h1 className="text-white text-4xl font-bold mb-3 relative z-[1]">Join Us.</h1>
            <p className="text-[rgba(255,255,255,0.8)] text-sm leading-relaxed mb-6 relative z-[1]">Create your account to get started.</p>

            <div className="flex flex-col gap-3.5 relative z-[1]">
              {["Use 8+ chars with Aa1@", "Secure authentication", "24/7 support"].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-[rgba(255,255,255,0.8)] text-sm">
                  <div className="w-6 h-6 bg-[rgba(255,255,255,0.1)] rounded-md flex items-center justify-center text-xs shrink-0">✓</div>
                  <span>{text}</span>
                </div>
              ))}

              <div className="flex items-center my-5 text-[rgba(255,255,255,0.5)] text-sm before:content-[''] before:flex-1 before:h-px before:bg-[rgba(255,255,255,0.1)] after:content-[''] after:flex-1 after:h-px after:bg-[rgba(255,255,255,0.1)]">
                <span className="px-4">OR</span>
              </div>
              <Button type="button" variant="secondary" onClick={handleGoogleRegister} className={`${googleBtnClass} !bg-[rgba(255,255,255,0.05)] !text-white`} disabled={isLoading || googleLoading}>
                <GoogleIcon />
                {googleLoading ? "Connecting..." : "Continue with Google"}
              </Button>

              <div className="text-center mt-4 text-[rgba(255,255,255,0.7)] text-sm">
                <span>Already have an account? </span>
                <Link to="/login" className="text-brand-blue no-underline font-semibold transition-colors duration-300 hover:text-[#5a67d8]">Sign in</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(RegisterPage);
