import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    if (res.success && res.data) {
      const userData = {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      };
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
    return res;
  };

  const register = async (name, email, password, role) => {
    const res = await apiRegister(name, email, password, role);
    if (res.success && res.data) {
      const userData = {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      };
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const isAdmin = user?.role === "ADMIN";
  const isUser = user?.role === "USER";

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
