import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../data/auth";
import "./auth.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const result = await loginUser({
        email: email.trim(),
        password,
      });

      if (!result.token || !result.user) {
        throw new Error("Invalid login response from server.");
      }

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
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
          <span>
            Audit<span className="brand-light">Trail</span>
          </span>
        </div>

        <div className="showcase-content">
          <span className="showcase-label">
            <span className="status-dot" />
            SECURE AUDIT PLATFORM
          </span>

          <h1>
            Every event.
            <br />
            Every change.
            <br />
            <span>Verified.</span>
          </h1>

          <p>
            Track shipments, monitor activity, and verify data integrity
            through a secure, transparent audit system.
          </p>

          <div className="showcase-features">
            <div className="feature-item">
              <span className="feature-check">✓</span>
              Real-time shipment tracking
            </div>

            <div className="feature-item">
              <span className="feature-check">✓</span>
              Cryptographic audit verification
            </div>

            <div className="feature-item">
              <span className="feature-check">✓</span>
              Role-based access control
            </div>
          </div>
        </div>

        <div className="showcase-footer">
          © 2026 AuditTrail. Secure operations, trusted records.
        </div>

        <div className="showcase-decoration decoration-one" />
        <div className="showcase-decoration decoration-two" />
      </section>

      <section className="auth-form-section">
        <div className="auth-form-container">
          <div className="mobile-brand">
            <div className="brand-icon">A</div>
            <span>
              Audit<span className="brand-light">Trail</span>
            </span>
          </div>

          <div className="form-heading">
            <span className="form-eyebrow">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your credentials to access your workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <div className="password-label">
                <label htmlFor="password">Password</label>
                <span className="secure-label">SECURE LOGIN</span>
              </div>

              <div className="password-input">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
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
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <div className="auth-divider">
            <span>SECURE ACCESS</span>
          </div>

          <p className="register-prompt">
            Don't have an account?{" "}
            <Link to="/register">Create account</Link>
          </p>

          <div className="security-note">
            <span>◆</span>
            Your workspace is protected with secure authentication.
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;