import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="page-container center-content">
      <div className="hero">
        <i className="bi bi-shield-check hero-icon"></i>
        <h1>Django + React JWT Auth</h1>
        <p>Signup, password hashing, JWT login, and protected routes — end to end.</p>
        {user ? (
          <Link to="/dashboard" className="btn btn-primary">
            Go to dashboard <i className="bi bi-arrow-right"></i>
          </Link>
        ) : (
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">
              Get started
            </Link>
            <Link to="/login" className="btn btn-ghost">
              I have an account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
