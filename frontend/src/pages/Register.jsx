import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = { username: "", email: "", password: "", password2: "" };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      const data = err.response?.data;
      setErrors(data && typeof data === "object" ? data : { general: "Registration failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (name) => (errors[name] ? errors[name][0] || errors[name] : null);

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-icon">
          <i className="bi bi-person-plus"></i>
        </div>
        <h1>Create an account</h1>
        <p className="auth-subtitle">Sign up to get started</p>

        {success && (
          <div className="alert alert-success">
            <i className="bi bi-check-circle-fill"></i> Account created! Redirecting to login...
          </div>
        )}
        {errors.general && (
          <div className="alert alert-error">
            <i className="bi bi-exclamation-triangle-fill"></i> {errors.general}
          </div>
        )}

        <label className="field">
          <span>Username</span>
          <div className="input-group">
            <i className="bi bi-person"></i>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="janedoe"
              required
            />
          </div>
          {fieldError("username") && <small className="field-error">{fieldError("username")}</small>}
        </label>

        <label className="field">
          <span>Email</span>
          <div className="input-group">
            <i className="bi bi-envelope"></i>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>
          {fieldError("email") && <small className="field-error">{fieldError("email")}</small>}
        </label>

        <label className="field">
          <span>Password</span>
          <div className="input-group">
            <i className="bi bi-lock"></i>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              required
            />
          </div>
          {fieldError("password") && <small className="field-error">{fieldError("password")}</small>}
        </label>

        <label className="field">
          <span>Confirm password</span>
          <div className="input-group">
            <i className="bi bi-lock-fill"></i>
            <input
              type="password"
              name="password2"
              value={form.password2}
              onChange={handleChange}
              placeholder="Repeat password"
              required
            />
          </div>
          {fieldError("password2") && <small className="field-error">{fieldError("password2")}</small>}
        </label>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Creating account..." : "Sign up"}
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
