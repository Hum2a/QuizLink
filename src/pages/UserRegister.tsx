import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userAuthService } from '../services/userAuth';
import '../App.css';

function UserRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    
    try {
      await userAuthService.register(
        formData.email, 
        formData.password, 
        formData.username,
        formData.displayName
      );
      navigate('/');
    } catch (err) {
      setError((err as Error).message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="join-screen">
        <h1>🎉 Join QuizLink!</h1>
        <p className="subtitle">Create your account to start playing</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username (unique, 3+ characters)"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
            required
            minLength={3}
            maxLength={20}
            autoFocus
          />

          <input
            type="text"
            placeholder="Display Name (shown in games)"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            required
            maxLength={50}
          />

          <input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
          
          <button 
            type="submit" 
            className="btn-player btn-full-width"
            disabled={loading}
          >
            {loading ? 'Creating account...' : '🎮 Create Account & Start Playing'}
          </button>
        </form>

        <div className="auth-links">
          <p>Already have an account?</p>
          <Link to="/login" className="link-primary">
            Login →
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

export default UserRegister;

