import { createContext, useState, useCallback } from "react";

/**
 * @typedef {Object} Toast
 * @property {string} id
 * @property {string} message
 * @property {'success' | 'error'} type
 */

/**
 * @typedef {Object} ToastContextValue
 * @property {Toast[]} toasts
 * @property {(message: string, type?: 'success' | 'error') => void} showToast
 * @property {(id: string) => void} removeToast
 */

export const ToastContext = createContext(undefined);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}
