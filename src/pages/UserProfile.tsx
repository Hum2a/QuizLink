import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAuthService } from '../services/userAuth';
import type { User } from '../services/userAuth';
import '../styles/admin.css';

interface GameHistory {
  quiz_title: string | null;
  room_code: string;
  score: number;
  rank: number | null;
  played_at: string;
}

interface QuizStat {
  id: string;
  quiz_title: string;
  times_played: number;
  best_score: number;
  avg_score: number;
  total_correct: number;
  total_questions: number;
}

interface ProfileData {
  user: User;
  recent_games: GameHistory[];
  quiz_stats: QuizStat[];
}

function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await userAuthService.getCurrentUser();
      
      if (!currentUser) {
        navigate('/register');
        return;
      }

      setUser(currentUser);
      const profileData = await userAuthService.getUserProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLogout = () => {
    userAuthService.logout();
    navigate('/register');
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading profile...</div>
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
          <Link to="/" className="btn-back">← Back to Game</Link>
          <h1>👤 My Profile</h1>
        </div>
        <button onClick={handleLogout} className="btn-secondary">
          🚪 Logout
        </button>
      </header>

      <div className="admin-dashboard">
        {/* User Info Card */}
        <div className="dashboard-welcome">
          <div className="profile-avatar" style={{ backgroundColor: user.avatar_color }}>
            {user.display_name.charAt(0).toUpperCase()}
          </div>
          <h2>{user.display_name}</h2>
          <p className="profile-username">@{user.username}</p>
          <p className="profile-email">{user.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">🎮</div>
            <div className="stat-info">
              <div className="stat-value">{user.total_games_played}</div>
              <div className="stat-label">Games Played</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <div className="stat-value">{user.total_score.toLocaleString()}</div>
              <div className="stat-label">Total Score</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <div className="stat-value">{user.highest_score}</div>
              <div className="stat-label">Highest Score</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
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

        {/* Recent Games */}
        <div className="analytics-section">
          <h2>🎮 Recent Games</h2>
          {profile && profile.recent_games && profile.recent_games.length > 0 ? (
            <div className="leaderboard-table">
              <table>
                <thead>
                  <tr>
                    <th>Quiz</th>
                    <th>Score</th>
                    <th>Rank</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.recent_games.map((game, index) => (
                    <tr key={index}>
                      <td>{game.quiz_title || `Room ${game.room_code}`}</td>
                      <td className="score-cell">{game.score} pts</td>
                      <td>#{game.rank || '?'}</td>
                      <td>{new Date(game.played_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state-small">
              <p>No games played yet. Join a quiz to get started!</p>
              <Link to="/" className="btn-primary btn-play-now">
                Play Now
              </Link>
            </div>
          )}
        </div>

        {/* Quiz Stats */}
        {profile?.quiz_stats?.length > 0 && (
          <div className="analytics-section">
            <h2>📊 Quiz Performance</h2>
            <div className="quiz-grid">
              {profile.quiz_stats.map((stat) => (
                <div key={stat.id} className="quiz-card">
                  <h3>{stat.quiz_title}</h3>
                  <div className="quiz-meta">
                    <span className="quiz-stat">🎮 {stat.times_played} plays</span>
                    <span className="quiz-stat">🏆 Best: {stat.best_score}</span>
                  </div>
                  <div className="quiz-meta">
                    <span className="quiz-stat">📊 Avg: {stat.avg_score}</span>
                    <span className="quiz-stat">✅ {stat.total_correct}/{stat.total_questions} correct</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;

