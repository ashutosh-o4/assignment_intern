import { useContext } from "react";
import { AuthContext } from "../context/AuthContex";

/**
 * Custom hook to safely consume the authentication context.
 * This should be the ONLY way components interact with auth state.
 *
 * @returns {{
 *   user: import("../context/AuthContex").User | null,
 *   token: string | null,
 *   isAuthenticated: boolean,
 *   isAdmin: boolean,
 *   login: (authResponse: import("../context/AuthContex").AuthResponse) => void,
 *   logout: () => void
 * }}
 * @throws {Error} If called outside of an <AuthProvider>
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  
  return context;
};
