import { Link, useNavigate } from "react-router-dom";
import Background from "@components/Background/Background";
import { useLogin } from "@/hooks/auth/useLogin";
import { useGoogleAuth } from "@/hooks/auth/useGoogleAuth";
import { Input, Button } from "../../components/common";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../context/store";
import { APP_ROUTES } from "../../constants/routes";



const inputWrapperClass = "relative flex items-center bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl p-3.5 transition-all duration-300 focus-within:border-brand-primary focus-within:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]";
const inputClass = "bg-transparent border-none text-white text-sm w-full outline-none placeholder:text-[rgba(255,255,255,0.5)]";
const iconClass = "text-[rgba(255,255,255,0.6)] mr-3 shrink-0 text-base min-w-5 flex items-center justify-center";
const passwordIconClass = "text-[rgba(255,255,255,0.6)] mr-3 shrink-0 text-base min-w-5 flex items-center justify-center text-[10px] before:content-['⬤'] before:bg-linear-to-br before:from-brand-primary before:to-brand-secondary before:bg-clip-text before:text-transparent";
const toggleClass = "bg-none border-none text-[rgba(255,255,255,0.6)] cursor-pointer p-1 rounded transition-colors duration-300 hover:text-white text-xs min-w-10";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
 const togglePasswordVisibility = () => setShowPassword(prev => !prev);
  const navigate = useNavigate();
const adminUser = useSelector(
  (state: RootState) => state.auth.adminUser
);

const normalUser = useSelector(
  (state: RootState) => state.auth.normalUser
);

const user = adminUser ?? normalUser;
  // If already logged in, never show login page (Back button, manual URL, etc.)
  useEffect(() => {
    if (!user) return;
    const role = (user.role || "").toLowerCase();

    if (role === "admin") {
      navigate(APP_ROUTES.ADMIN_DASHBOARD, { replace: true });
    } else if (role === "company") {
      navigate(APP_ROUTES.COMPANY_DASHBOARD, { replace: true });
    } else if (role === "hr") {
      navigate(APP_ROUTES.HR_DASHBOARD, { replace: true });
    } else if (role === "interviewer") {
      navigate(APP_ROUTES.INTERVIEWER_ASSIGNMENTS, { replace: true });
    } else {
      navigate(APP_ROUTES.CANDIDATE_INTERVIEWS, { replace: true });
    }
  }, [user, navigate]);

  const { isLoading, error, data } = useLogin();
  const { form, onSubmit } = data;
  const { register, handleSubmit, formState } = form;
  const google = useGoogleAuth();
  const { initiateGoogleAuth } = google.data;
  const googleLoading = google.isLoading;
  const googleError = google.error;

  const errorToShow =
    error ||
    googleError ||
    formState.errors.root?.message ||
    formState.errors.email?.message ||
    formState.errors.password?.message; 

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-center">
      <Background />
      <div className="bg-[rgba(15,15,25,0.95)] rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] w-full max-w-[960px] min-h-[600px] overflow-hidden relative flex flex-col max-md:rounded-2xl max-sm:rounded-xl max-sm:min-h-[520px]">
        {/* Auth Header */}
        <div className="py-5 px-7 border-b border-[rgba(255,255,255,0.1)] flex justify-between items-center max-md:py-4 max-md:px-5">
          <div className="flex items-center gap-3">
            <h2 className="text-white text-lg font-semibold tracking-wider " >DEVIEW</h2>
          </div>
        </div>
        {/* Auth Content */}
        <div className="grid grid-cols-1 min-[680px]:grid-cols-[1fr_1.2fr] flex-1">
          {/* Form Section */}
          <div className="py-8 px-8 flex flex-col justify-center relative text-center max-sm:py-6 max-sm:px-5">
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
              <div className="mb-3.5">
                <div className={inputWrapperClass}>
                  <span className={iconClass}>@</span>
                  <Input
                    type="email"
                    placeholder="Email"
                    className={inputClass}
                    {...register("email")}
                    
                    autoComplete="email"
                  />
                </div>
                
              </div>
              <div className="mb-3.5">
                <div className={inputWrapperClass}>
                  <span className={passwordIconClass}></span>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className={inputClass}
                    {...register("password")}
                    
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className={`${toggleClass} !bg-none !text-[rgba(255,255,255,0.6)]`}
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </div>
            {errorToShow && (
                <div className="text-brand-red text-sm mb-3 block" role="alert">
                  {typeof errorToShow === "string" ? errorToShow : String(errorToShow)}
                </div>
              )}
                
              </div>
              <div className="flex justify-between items-center mb-4">
                <Link to="/forgot-password" className="text-brand-primary no-underline text-sm transition-colors duration-300 hover:text-[#5a67d8]">
                  Forgot your password?
                </Link>
              </div>

              <Button type="submit" variant="primary" className="w-full p-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none" disabled={isLoading || googleLoading}>
                {isLoading ? "Logging in..." : "LOGIN"}
              </Button>

              {/* Divider */}
              <div className="flex items-center my-4 text-[rgba(255,255,255,0.5)] text-sm before:content-[''] before:flex-1 before:h-px before:bg-[rgba(255,255,255,0.1)] after:content-[''] after:flex-1 after:h-px after:bg-[rgba(255,255,255,0.1)]">
                <span className="px-4">OR</span>
              </div>

              {/* Google Login */}
              <Button
                type="button"
                variant="secondary"
                onClick={() => initiateGoogleAuth()}
                className="w-full py-3 px-4 border border-[rgba(255,255,255,0.2)] rounded-xl text-sm font-medium flex items-center justify-center gap-3 !bg-[rgba(255,255,255,0.05)] !text-white disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading || googleLoading}
              >
                <svg className="shrink-0" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {googleLoading ? "Connecting..." : "Continue with Google"}
              </Button>
            </form>
            {/* Mobile auth links */}
            <div className="hidden max-[679px]:block text-center mt-5 text-[rgba(255,255,255,0.7)] text-sm">
              <span>New here? </span>
              <Link to="/register" className="text-brand-blue no-underline font-semibold transition-colors duration-300 hover:text-[#5a67d8]">Sign up</Link>
            </div>
          </div>
          {/* Welcome Section - hidden on mobile */}
          <div className="hidden min-[680px]:flex bg-linear-to-br from-[rgba(102,126,234,0.1)] to-[rgba(118,75,162,0.1)] py-8 px-8 flex-col justify-center relative overflow-hidden text-center">
            <h1 className="text-white text-4xl font-bold mb-4 relative z-[1]">Welcome.</h1>
            <p className="text-[rgba(255,255,255,0.8)] text-sm leading-relaxed mb-6 relative z-[1]">
              Sign in to access your account and manage your profile. Stay connected with the latest updates and
              opportunities.
            </p>
            <div className="text-[rgba(255,255,255,0.7)] text-sm relative z-[1]">
              <span>New here? </span>
              <Link to="/register" className="text-brand-blue no-underline font-semibold transition-colors duration-300 hover:text-[#5a67d8]">Sign up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
