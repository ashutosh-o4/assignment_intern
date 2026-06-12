import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import axiosInstance from "../apis/axios";
import FormInput from "../component/FormInput";
import "./Auth.css";

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSessionBanner, setShowSessionBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // 1. Redirect authenticated users away from the login page immediately
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 2. Handle session expiry banner logic
  useEffect(() => {
    if (searchParams.get("reason") === "session_expired") {
      setShowSessionBanner(true);
      searchParams.delete("reason");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setApiError("");
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    setApiError("");

    try {
      // POST to backend API using our custom axios instance
      const response = await axiosInstance.post("/auth/login", formData);
      
      // Update global auth state with the returned token and user
      login(response.data);
      
      showToast("Successfully logged in! Welcome back.", "success");
      
      // Navigate to dashboard
      navigate("/dashboard", { replace: true });
    } catch (error) {
      // Keep email, but clear the password field on failure
      setFormData(prev => ({ ...prev, password: "" }));
      
      // Extract backend error message if available
      const message = error.response?.data?.message || "Invalid credentials or network error.";
      setApiError(message);
      showToast("Login failed. Please check your credentials.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent rendering the form briefly while the redirect effect runs
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="auth-container">
      {showSessionBanner && (
        <div className="auth-banner">
          <strong>Notice:</strong> Your session expired, please log in again.
        </div>
      )}
      
      {apiError && (
        <div className="auth-banner">
          {apiError}
        </div>
      )}

      <h2 className="auth-title">Welcome Back</h2>
      
      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={isLoading}
          placeholder="you@example.com"
        />

        <FormInput
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          disabled={isLoading}
          placeholder="••••••••"
        />

        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading && <div className="spinner"></div>}
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>
      
      <div className="auth-footer">
        Don't have an account? <Link to="/register" className="auth-link">Register</Link>
      </div>
    </div>
  );
}
