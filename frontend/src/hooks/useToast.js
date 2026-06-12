import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";

/**
 * Custom hook to safely consume the ToastContext.
 * @returns {import("../context/ToastContext").ToastContextValue}
 * @throws {Error} If called outside of a <ToastProvider>
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  
  return context;
};
