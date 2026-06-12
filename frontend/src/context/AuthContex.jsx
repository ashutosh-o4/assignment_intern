import { createContext, useContext, useReducer, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { injectAxiosInterceptors } from "../apis/axios";

// ── JSDoc Type Definitions ──────────────────────────────────────────

/**
 * @typedef {{ id: string, name: string, email: string, role: string }} User
 *
 * @typedef {{ token: string | null, user: User | null }} AuthState
 *
 * @typedef {{ token: string, user: User }} AuthResponse
 *   Shape returned by POST /auth/login on success.
 *
 * @typedef {{
 *   token: string | null,
 *   user: User | null,
 *   isAuthenticated: boolean,
 *   isAdmin: boolean,
 *   login: (authResponse: AuthResponse) => void,
 *   logout: () => void,
 * }} AuthContextValue
 */

// ── Constants ───────────────────────────────────────────────────────

const STORAGE_KEYS = Object.freeze({
  TOKEN: "token",
  USER: "user",
});

/** @enum {string} */
const ActionType = Object.freeze({
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
});

// ── Reducer ─────────────────────────────────────────────────────────

/** @type {AuthState} */
const INITIAL_STATE = { token: null, user: null };

/**
 * Pure reducer — no side-effects. localStorage writes happen in the
 * action dispatchers so the reducer stays testable.
 *
 * @param {AuthState} state
 * @param {{ type: string, payload?: AuthResponse }} action
 * @returns {AuthState}
 */
function authReducer(state, action) {
  switch (action.type) {
    case ActionType.LOGIN:
      return {
        token: action.payload.token,
        user: action.payload.user,
      };
    case ActionType.LOGOUT:
      return { ...INITIAL_STATE };
    default:
      return state;
  }
}

// ── Context ─────────────────────────────────────────────────────────

/** @type {import("react").Context<AuthContextValue | undefined>} */
export const AuthContext = createContext(undefined);

// ── Helper: safe localStorage read ─────────────────────────────────

/**
 * Rehydrate auth state from localStorage.
 * Returns INITIAL_STATE if anything is missing or corrupt.
 * @returns {AuthState}
 */
function loadStateFromStorage() {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!token || !raw) return { ...INITIAL_STATE };

    /** @type {User} */
    const user = JSON.parse(raw);

    // Basic shape check — reject garbage data
    if (!user.id || !user.email || !user.role) return { ...INITIAL_STATE };

    return { token, user };
  } catch {
    // Corrupt JSON → start fresh
    return { ...INITIAL_STATE };
  }
}

// ── Provider Component ──────────────────────────────────────────────

/**
 * Wrap your app (or router) with <AuthProvider> to make auth state
 * available everywhere via useAuth().
 *
 * @param {{ children: import("react").ReactNode }} props
 */
export function AuthProvider({ children }) {
  // Rehydrate from localStorage on first render only
  const [state, dispatch] = useReducer(authReducer, null, loadStateFromStorage);
  const navigate = useNavigate();

  /**
   * Persist token + user on every LOGIN state change.
   * Keeps localStorage in sync even if login is called multiple times
   * (e.g. token refresh).
   */
  useEffect(() => {
    if (state.token && state.user) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, state.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
    }
  }, [state.token, state.user]);

  /**
   * Call after a successful /auth/login response.
   * Persists credentials and updates React state in one shot.
   * @param {AuthResponse} authResponse
   */
  const login = (authResponse) => {
    dispatch({ type: ActionType.LOGIN, payload: authResponse });
  };

  /**
   * Wipe all auth data — localStorage + in-memory state.
   * After this call isAuthenticated === false.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    dispatch({ type: ActionType.LOGOUT });
  }, []);

  // Inject hooks into the axios instance so API 401s can trigger a clean logout
  useEffect(() => {
    injectAxiosInterceptors(logout, navigate);
  }, [logout, navigate]);

  // Derived flags — recomputed only when state reference changes
  const isAuthenticated = !!state.token;
  const isAdmin = state.user?.role === "ADMIN";

  /** @type {AuthContextValue} */
  const value = useMemo(
    () => ({ ...state, isAuthenticated, isAdmin, login, logout }),
    [state, isAuthenticated, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

