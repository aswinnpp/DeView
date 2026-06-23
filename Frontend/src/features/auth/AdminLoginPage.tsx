import { Link } from "react-router-dom";
import { useLogin } from "@/hooks/auth/useLogin";
import { useGoogleAuth } from "@/hooks/auth/useGoogleAuth";
import { Input, Button } from "../../components/common";
import { useState } from "react";
import { APP_ROUTES } from "../../constants/routes";

const AdminLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const { isLoading, error, data } = useLogin({ mode: "admin" });
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-white text-xl font-semibold">Admin Login</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to the admin dashboard</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4"
        >
          <div className="text-left">
            <label htmlFor="admin-email" className="block text-slate-300 text-sm mb-1.5">
              Email
            </label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@example.com"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
              {...register("email")}
              autoComplete="email"
            />
          </div>

          <div className="text-left">
            <label htmlFor="admin-password" className="block text-slate-300 text-sm mb-1.5">
              Password
            </label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 pr-16 text-white text-sm outline-none focus:border-indigo-500"
                {...register("password")}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs hover:text-white"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {errorToShow && (
            <p className="text-red-400 text-sm text-left" role="alert">
              {typeof errorToShow === "string" ? errorToShow : String(errorToShow)}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 rounded-md text-sm font-medium"
            disabled={isLoading || googleLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => initiateGoogleAuth("admin", "admin")}
            className="w-full py-2.5 rounded-md text-sm !bg-slate-950 !text-white border border-slate-700 hover:!bg-slate-800"
            disabled={isLoading || googleLoading}
          >
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </Button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          <Link to={APP_ROUTES.LOGIN} className="text-indigo-400 hover:text-indigo-300 no-underline">
            Back to user login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
