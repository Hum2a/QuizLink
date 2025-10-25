import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { FaSignInAlt, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
import '../styles/admin.css';

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      navigate('/admin');
    } catch (err) {
      setError((err as Error).message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="join-screen">
        <h1>
          <MdAdminPanelSettings className="title-icon" /> Admin Login
        </h1>
        <p className="subtitle">Sign in to manage your quizzes</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />

          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className={`password-toggle ${
                showPassword ? 'showing' : 'hiding'
              }`}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            className="btn-primary btn-full-width"
            disabled={loading}
          >
            {loading ? (
              'Logging in...'
            ) : (
              <>
                <FaSignInAlt /> Login
              </>
            )}
          </button>
        </form>

        <div className="auth-links">
          <p>Don't have an account?</p>
          <Link to="/admin/register" className="link-primary">
            Create Account <FaArrowRight />
          </Link>
        </div>

        <div className="auth-divider">
          <Link to="/" className="link-secondary">
            ← Back to Quiz
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
