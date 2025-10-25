import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userAuthService } from '../services/userAuth';
import { FaGamepad, FaArrowRight, FaSignInAlt } from 'react-icons/fa';
import '../App.css';

function UserLogin() {
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await userAuthService.login(emailOrUsername, password);
      navigate('/');
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
          <FaGamepad className="title-icon" /> Welcome Back!
        </h1>
        <p className="subtitle">Login to QuizLink</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email or Username"
            value={emailOrUsername}
            onChange={e => setEmailOrUsername(e.target.value)}
            required
            autoFocus
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="btn-player btn-full-width"
            disabled={loading}
          >
            {loading ? (
              'Logging in...'
            ) : (
              <>
                <FaSignInAlt /> Login & Play
              </>
            )}
          </button>
        </form>

        <div className="auth-links">
          <p>Don't have an account?</p>
          <Link to="/register" className="link-primary">
            Create Account <FaArrowRight />
          </Link>
        </div>

        <div className="auth-links">
          <Link to="/forgot-password" className="link-secondary">
            Forgot Password?
          </Link>
        </div>

        <div className="auth-divider">
          <Link to="/admin" className="link-secondary">
            Admin Login →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
