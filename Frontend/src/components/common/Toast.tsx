import { useEffect, useRef, useState } from "react";
import { subscribe, type Toast, type ToastType } from "./toastService";

export function ToastContainer() {
  const [toast, setToast] = useState<Toast | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const unsubscribe = subscribe((newToast) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToast(newToast);

      timeoutRef.current = window.setTimeout(() => {
        setToast(null);
      }, 5000);
    });

    return () => {
      unsubscribe();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!toast) return null;

  const base =
    "pointer-events-auto min-w-[240px] max-w-sm px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-start gap-2";

  const styles: Record<ToastType, string> = {
    success: "bg-emerald-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-slate-800 text-slate-100 border border-slate-600",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className={`${base} ${styles[toast.type]}`}>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}