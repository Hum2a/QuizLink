import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { FaSignInAlt, FaArrowRight } from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
import '../styles/admin.css';

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        <h1><MdAdminPanelSettings className="title-icon" /> Admin Login</h1>
        <p className="subtitle">Sign in to manage your quizzes</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <button 
            type="submit" 
            className="btn-primary btn-full-width"
            disabled={loading}
          >
            {loading ? 'Logging in...' : <><FaSignInAlt /> Login</>}
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
