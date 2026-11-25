import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../data/auth";
import "./auth.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const result = await registerUser({
        name,
        email,
        password,
      });

      navigate("/login", {
        state: {
          message: result.message || "Account created successfully. Please sign in.",
        },
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <div className="auth-brand">
          <div className="brand-icon">A</div>
          <span>Audit<span className="brand-light">Trail</span></span>
        </div>

        <div className="showcase-content">
          <span className="showcase-label">
            <span className="status-dot" />
            SECURE AUDIT PLATFORM
          </span>

          <h1>
            Build trust.
            <br />
            Track every
            <br />
            <span>transaction.</span>
          </h1>

          <p>
            Create your workspace and manage shipment records,
            audit activity, and data integrity in one place.
          </p>
        </div>

        <div className="showcase-footer">
          © 2026 AuditTrail. Secure operations, trusted records.
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-container">
          <div className="mobile-brand">
            <div className="brand-icon">A</div>
            <span>Audit<span className="brand-light">Trail</span></span>
          </div>

          <div className="form-heading">
            <span className="form-eyebrow">GET STARTED</span>
            <h2>Create your account</h2>
            <p>Enter your details to create your AuditTrail account.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Email address</label>
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm password</label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            {message && (
              <div className="auth-message" role="alert">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <div className="auth-divider">
            <span>SECURE REGISTRATION</span>
          </div>

          <p className="register-prompt">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>

          <div className="security-note">
            <span>◆</span>
            Your account is protected with secure authentication.
          </div>
        </div>
      </section>
    </main>
  );
}

export default Register;