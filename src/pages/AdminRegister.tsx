import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { FaUserPlus, FaArrowRight } from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
import '../styles/admin.css';

function AdminRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
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

    setLoading(true);
    
    try {
      await authService.register(formData.email, formData.password, formData.name);
      navigate('/admin');
    } catch (err) {
      setError((err as Error).message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="join-screen">
        <h1><MdAdminPanelSettings className="title-icon" /> Create Admin Account</h1>
        <p className="subtitle">Set up your QuizLink admin account</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            autoFocus
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
            className="btn-primary btn-full-width"
            disabled={loading}
          >
            {loading ? 'Creating account...' : <><FaUserPlus /> Create Account</>}
          </button>
        </form>

        <div className="auth-links">
          <p>Already have an account?</p>
          <Link to="/admin/login" className="link-primary">
            Login <FaArrowRight />
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

export default AdminRegister;

