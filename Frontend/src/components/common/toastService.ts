export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

type Listener = (toast: Toast) => void;

const listeners: Listener[] = [];
let counter = 0;

export function subscribe(listener: Listener) {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export function showToast(message: string, type: ToastType = "info") {
  const toast: Toast = { id: ++counter, type, message };
  listeners.forEach((listener) => listener(toast));
}

