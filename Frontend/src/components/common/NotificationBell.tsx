import type { ComponentProps, ReactNode } from "react";
import Button from "./Button";

type BaseProps = {
  /** Number to show in the badge. If 0/undefined, badge hidden (unless showBadge=true). */
  count?: number;
  /** Force showing the badge even when count is 0. */
  showBadge?: boolean;
  /** Override badge contents (defaults to count). */
  badgeContent?: ReactNode;
  /** Customize badge styles/position. */
  badgeClassName?: string;
  /** Customize svg size (defaults 18). */
  size?: number;
  /** Accessible label for the bell button. */
  ariaLabel?: string;
};

type CommonButtonProps = BaseProps & {
  as?: "common";
  variant?: ComponentProps<typeof Button>["variant"];
} & Omit<ComponentProps<typeof Button>, "children" | "variant" | "aria-label">;

type NativeButtonProps = BaseProps & {
  as: "native";
} & Omit<ComponentProps<"button">, "children" | "aria-label">;

export type NotificationBellProps = CommonButtonProps | NativeButtonProps;

export default function NotificationBell(props: NotificationBellProps) {
  const {
    count,
    showBadge,
    badgeContent,
    badgeClassName = "",
    size = 18,
    ariaLabel = "Notifications",
  } = props;

  const shouldShowBadge = showBadge ?? (typeof count === "number" ? count > 0 : false);
  const badge = badgeContent ?? count;

  const content = (
    <>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {shouldShowBadge && (
        <span
          className={`absolute top-0 right-0 bg-[#ef4444] text-white px-1.5 py-0.5 text-[10px] font-bold rounded-full ${badgeClassName}`.trim()}
        >
          {badge}
        </span>
      )}
    </>
  );

  if (props.as === "native") {
    const { className = "", ...buttonProps } = props;
    return (
      <button aria-label={ariaLabel} type="button" className={className} {...buttonProps}>
        {content}
      </button>
    );
  }

  const { variant = "secondary", className = "", ...buttonProps } = props;
  return (
    <Button aria-label={ariaLabel} variant={variant} className={className} {...buttonProps}>
      {content}
    </Button>
  );
}

