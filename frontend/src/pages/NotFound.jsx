import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "80vh",
      fontFamily: "sans-serif",
      textAlign: "center",
      padding: "2rem"
    }}>
      <h1 style={{ fontSize: "3rem", color: "#6b7280", margin: "0 0 1rem 0" }}>
        404
      </h1>
      <h2 style={{ fontSize: "1.5rem", color: "#1f2937", margin: "0 0 1rem 0" }}>
        Page Not Found
      </h2>
      <p style={{ color: "#4b5563", maxWidth: "400px", marginBottom: "2rem" }}>
        The page you are looking for might have been removed, had its name changed, 
        or is temporarily unavailable.
      </p>
      
      <Link 
        to="/dashboard"
        style={{
          padding: "0.5rem 1.5rem",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "0.375rem",
          fontSize: "1rem",
          textDecoration: "none",
          transition: "background-color 0.2s"
        }}
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
