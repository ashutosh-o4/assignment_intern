import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import axiosInstance from "../apis/axios";
import FormInput from "../component/FormInput";
import "./Auth.css";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "",
    role: "USER" 
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
    
    if (!formData.name.trim()) newErrors.name = "Name is required";

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
      // POST to backend API
      const response = await axiosInstance.post("/auth/register", formData);
      
      // Auto-login upon successful registration
      login(response.data);
      
      showToast("Account created successfully! Welcome aboard.", "success");
      
      // Navigate to dashboard
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || "An error occurred during registration. Please try again.";
      setApiError(message);
      showToast("Registration failed. Please check the form.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="auth-container">
      {apiError && (
        <div className="auth-banner">
          {apiError}
        </div>
      )}

      <h2 className="auth-title">Create an Account</h2>
      
      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          label="Full Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          disabled={isLoading}
          placeholder="John Doe"
        />

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

        <div className="form-group">
          <label htmlFor="role" className="form-label">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="form-select"
            disabled={isLoading}
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
          {/* Reserve space just like FormInput does for consistency */}
          <div className="form-error" style={{ visibility: "hidden" }}> </div>
        </div>

        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading && <div className="spinner"></div>}
          {isLoading ? "Creating Account..." : "Register"}
        </button>
      </form>
      
      <div className="auth-footer">
        Already have an account? <Link to="/login" className="auth-link">Login</Link>
      </div>
    </div>
  );
}
