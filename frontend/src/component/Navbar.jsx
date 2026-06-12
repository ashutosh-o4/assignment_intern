import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Do not render anything if the user is not logged in
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    // Redirect to login after logout
    navigate("/login", { replace: true });
  };

  const isAdmin = user.role === "ADMIN";

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-brand">MyApp</h1>
      </div>
      
      <div className="navbar-right">
        <span className="navbar-user-name">{user.name}</span>
        
        <span className={`navbar-badge ${isAdmin ? "badge-admin" : "badge-user"}`}>
          {user.role}
        </span>
        
        <button onClick={handleLogout} className="navbar-logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}
