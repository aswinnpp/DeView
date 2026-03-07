import type { ComponentProps } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "danger"
  | "violet"
  | "amber"
  | "amberGradient"
  | "ghost"
  | "ghostOutline"
  | "icon";

type ButtonProps = {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  className?: string;
} & ComponentProps<"button">;

const variantStyles: Record<Variant, string> = {
  primary: "px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700",
  secondary: "px-4 py-2 rounded text-white",
  danger: "px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700",
  violet:
    "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2.5 text-xs md:text-sm font-semibold text-white shadow-md shadow-violet-500/40 transition hover:from-violet-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-violet-500/80 focus:ring-offset-1 focus:ring-offset-slate-900",
  amber:
    "rounded-lg border border-amber-400/70 bg-amber-500/20 px-3 py-1.5 text-[11px] md:text-xs font-semibold text-amber-100 uppercase tracking-wide shadow-sm hover:bg-amber-500/30 transition",
  amberGradient:
    "inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-amber-500/40 transition hover:from-amber-400 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-60",
  ghost:
    "rounded-lg border border-slate-600/70 bg-slate-800/70 px-3 text-xs font-medium text-slate-100 transition hover:bg-slate-700/80",
  ghostOutline:
    "inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs sm:text-sm font-medium text-slate-200 hover:bg-slate-800 transition",
  icon: "rounded-full p-1 text-slate-400 hover:bg-slate-800/80 hover:text-slate-100",
};

const sizeStyles: Record<"sm" | "md" | "lg", string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type,
  ...props
}: ButtonProps) => {
  const useSize = ["primary", "secondary", "danger"].includes(variant);
  return (
    <button
      type={type ?? "button"}
      className={`${variantStyles[variant]} ${useSize ? sizeStyles[size] : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
