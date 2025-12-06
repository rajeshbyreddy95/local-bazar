'use client';
import { useEffect, useState } from 'react';
import { FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastId = 0;

const toastState: { listeners: Set<(toasts: Toast[]) => void>; toasts: Toast[] } = {
  listeners: new Set(),
  toasts: [],
};

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 4000) => {
  const id = String(toastId++);
  const toast: Toast = { id, message, type };

  toastState.toasts = [...toastState.toasts, toast];
  toastState.listeners.forEach(listener => listener(toastState.toasts));

  if (duration > 0) {
    setTimeout(() => {
      toastState.toasts = toastState.toasts.filter(t => t.id !== id);
      toastState.listeners.forEach(listener => listener(toastState.toasts));
    }, duration);
  }

  return id;
};

export default function Toast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastState.listeners.add(setToasts);
    return () => {
      toastState.listeners.delete(setToasts);
    };
  }, []);

  const removeToast = (id: string) => {
    toastState.toasts = toastState.toasts.filter(t => t.id !== id);
    toastState.listeners.forEach(listener => listener(toastState.toasts));
  };

  return (
    <div className="fixed top-6 right-6 z-9999 flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg animate-slide-in pointer-events-auto ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          {toast.type === 'success' && <FiCheckCircle className="text-xl shrink-0" />}
          {toast.type === 'error' && <FiAlertCircle className="text-xl shrink-0" />}
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-auto shrink-0 hover:opacity-80 transition"
          >
            <FiX className="text-xl" />
          </button>
        </div>
      ))}
    </div>
  );
}
