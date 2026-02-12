import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "danger";

type ButtonProps = {
  variant?: Variant;
  className?: string;
} & ComponentProps<"button">;

const variantStyles: Record<Variant, string> = {
  primary: "bg-blue-600 text-white",
  secondary: " text-black",
  danger: "bg-red-600 text-white",
};

const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`px-4 py-2 rounded ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
