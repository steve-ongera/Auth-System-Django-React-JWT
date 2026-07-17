import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div className="avatar">
            <i className="bi bi-person-fill"></i>
          </div>
          <div>
            <h1>Welcome, {user?.username}</h1>
            <p className="text-muted">This page is only reachable with a valid access token.</p>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">
              <i className="bi bi-hash"></i> User ID
            </span>
            <span className="info-value">{user?.id}</span>
          </div>
          <div className="info-item">
            <span className="info-label">
              <i className="bi bi-envelope"></i> Email
            </span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">
              <i className="bi bi-calendar-check"></i> Joined
            </span>
            <span className="info-value">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
