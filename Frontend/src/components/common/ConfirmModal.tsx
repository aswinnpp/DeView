import { type ReactNode, useEffect } from "react";
import Button from "./Button";

export type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  confirmVariant?: "primary" | "danger" | "secondary" | "violet";
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
};

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  confirmVariant = "danger",
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-200/10 bg-slate-900/95 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="m-0 text-base font-bold text-slate-100">{title}</h2>
        {description ? <p className="m-0 mt-2 text-sm text-slate-300">{description}</p> : null}

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button
            variant="ghostOutline"
            disabled={isLoading}
            onClick={onClose}
            className="sm:min-w-[108px]"
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            disabled={isLoading}
            onClick={() => {
              void onConfirm();
            }}
            className="sm:min-w-[140px]"
          >
            {isLoading ? "Working..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

