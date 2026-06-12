import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

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
      <h1 style={{ fontSize: "3rem", color: "#dc2626", margin: "0 0 1rem 0" }}>
        403
      </h1>
      <h2 style={{ fontSize: "1.5rem", color: "#1f2937", margin: "0 0 1rem 0" }}>
        Permission Denied
      </h2>
      <p style={{ color: "#4b5563", maxWidth: "400px", marginBottom: "2rem" }}>
        You do not have the necessary access rights to view the requested page. 
        If you believe this is a mistake, please contact your administrator.
      </p>
      
      <button 
        onClick={() => navigate(-1)}
        style={{
          padding: "0.5rem 1.5rem",
          backgroundColor: "#374151",
          color: "white",
          border: "none",
          borderRadius: "0.375rem",
          fontSize: "1rem",
          cursor: "pointer",
          transition: "background-color 0.2s"
        }}
      >
        Go Back
      </button>
    </div>
  );
}
