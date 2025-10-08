import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAuthService } from '../services/userAuth';
import type { User } from '../services/userAuth';
import {
  FaUser,
  FaGamepad,
  FaPlus,
  FaBook,
  FaSignOutAlt,
  FaTrophy,
  FaStar,
} from 'react-icons/fa';
import { IoStatsChart } from 'react-icons/io5';
import '../styles/admin.css';

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!userAuthService.isAuthenticated()) {
          navigate('/register');
          return;
        }

        const currentUser = await userAuthService.getCurrentUser();
        if (!currentUser) {
          navigate('/register');
          return;
        }

        setUser(currentUser);
      } catch (err) {
        console.error('Failed to load user:', err);
        navigate('/register');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleLogout = () => {
    userAuthService.logout();
    navigate('/register');
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <h1>🎮 QuizLink Dashboard</h1>
          <p>Welcome back, {user.display_name}!</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/profile" className="btn-secondary">
            <FaUser /> Profile
          </Link>
          <button onClick={handleLogout} className="btn-secondary">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <div className="admin-dashboard">
        {/* Quick Stats */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">
              <FaGamepad size={40} color="#667eea" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{user.total_games_played}</div>
              <div className="stat-label">Games Played</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaStar size={40} color="#667eea" />
            </div>
            <div className="stat-info">
              <div className="stat-value">
                {user.total_score.toLocaleString()}
              </div>
              <div className="stat-label">Total Score</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaTrophy size={40} color="#667eea" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{user.highest_score}</div>
              <div className="stat-label">Best Score</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <IoStatsChart size={40} color="#667eea" />
            </div>
            <div className="stat-info">
              <div className="stat-value">
                {user.total_games_played > 0
                  ? Math.round(user.total_score / user.total_games_played)
                  : 0}
              </div>
              <div className="stat-label">Avg Score</div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="dashboard-welcome">
          <h2>What would you like to do?</h2>
          <div className="action-cards">
            <Link to="/play" className="action-card action-card-primary">
              <div className="action-icon">
                <FaGamepad size={48} />
              </div>
              <h3>Play Quiz</h3>
              <p>Join an existing game or create a new one</p>
            </Link>

            <Link to="/my-quizzes" className="action-card">
              <div className="action-icon">
                <FaBook size={48} />
              </div>
              <h3>My Quizzes</h3>
              <p>Create and manage your own quizzes</p>
            </Link>

            <Link to="/browse-quizzes" className="action-card">
              <div className="action-icon">
                <IoStatsChart size={48} />
              </div>
              <h3>Browse Quizzes</h3>
              <p>Explore public quizzes to play</p>
            </Link>

            <Link to="/profile" className="action-card">
              <div className="action-icon">
                <FaTrophy size={48} />
              </div>
              <h3>My Stats</h3>
              <p>View your game history and achievements</p>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="analytics-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/create-game" className="btn-primary">
              <FaPlus /> Create New Game
            </Link>
            <Link to="/create-quiz" className="btn-secondary">
              <FaPlus /> Create New Quiz
            </Link>
            <Link to="/join-game" className="btn-secondary">
              <FaGamepad /> Join Game with Code
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .action-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .action-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .action-card:hover {
          border-color: #667eea;
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
        }

        .action-card-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }

        .action-card-primary:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
        }

        .action-icon {
          color: #667eea;
          margin-bottom: 1rem;
        }

        .action-card-primary .action-icon {
          color: white;
        }

        .action-card h3 {
          margin: 0.5rem 0;
          font-size: 1.5rem;
        }

        .action-card p {
          margin: 0.5rem 0 0;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .action-card-primary p {
          color: rgba(255, 255, 255, 0.9);
        }

        .quick-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .quick-actions .btn-primary,
        .quick-actions .btn-secondary {
          flex: 1;
          min-width: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
}

export default UserDashboard;
