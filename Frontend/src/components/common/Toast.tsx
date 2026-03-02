import { useEffect, useState } from "react";
import { subscribe, type Toast, type ToastType } from "./toastService";

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = subscribe((toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 5000);
    });
    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {toasts.map((toast) => {
        const base =
          "pointer-events-auto min-w-[240px] max-w-sm px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-start gap-2";
        const styles: Record<ToastType, string> = {
          success: "bg-emerald-500 text-white",
          error: "bg-red-500 text-white",
          info: "bg-slate-800 text-slate-100 border border-slate-600",
        };
        return (
          <div key={toast.id} className={`${base} ${styles[toast.type]}`}>
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}

