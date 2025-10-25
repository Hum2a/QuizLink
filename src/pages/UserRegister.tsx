import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userAuthService } from '../services/userAuth';
import { FaGamepad, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../App.css';

function UserRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        <h1>
          <FaGamepad className="title-icon" /> Join QuizLink!
        </h1>
        <p className="subtitle">Create your account to start playing</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username (unique, 3+ characters)"
            value={formData.username}
            onChange={e =>
              setFormData({
                ...formData,
                username: e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9_]/g, ''),
              })
            }
            required
            minLength={3}
            maxLength={20}
            autoFocus
          />

          <input
            type="text"
            placeholder="Display Name (shown in games)"
            value={formData.displayName}
            onChange={e =>
              setFormData({ ...formData, displayName: e.target.value })
            }
            required
            maxLength={50}
          />

          <input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={e =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength={6}
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

          <div className="password-input-container">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={e =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
            />
            <button
              type="button"
              className={`password-toggle ${
                showConfirmPassword ? 'showing' : 'hiding'
              }`}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword
                  ? 'Hide confirm password'
                  : 'Show confirm password'
              }
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            className="btn-player btn-full-width"
            disabled={loading}
          >
            {loading ? (
              'Creating account...'
            ) : (
              <>
                <FaGamepad /> Create Account & Start Playing
              </>
            )}
          </button>
        </form>

        <div className="auth-links">
          <p>Already have an account?</p>
          <Link to="/login" className="link-primary">
            Login <FaArrowRight />
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
