import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../components/AdminDashboard";
import UserDashboard from "../components/UserDashboard";

export default function Dashboard() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-layout">
      {/* ── Top Navigation Bar ── */}
      <header className="navbar" id="dashboard-navbar">
        <div className="navbar-left">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="url(#nav-logo)" />
            <path d="M12 20l5 5 11-11" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="nav-logo" x1="0" y1="0" x2="40" y2="40">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <span className="navbar-title">Task Manager</span>
        </div>

        <div className="navbar-right">
          <div className="user-info">
            <div className="user-avatar" id="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className={`role-badge role-${user?.role?.toLowerCase()}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <button
            id="logout-btn"
            className="btn btn-ghost"
            onClick={handleLogout}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="dashboard-main">
        {isAdmin ? <AdminDashboard /> : <UserDashboard />}
      </main>
    </div>
  );
}
