import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizAPI } from '../services/api';
import type { QuizTemplate, Analytics as AnalyticsData } from '../services/api';
import { FaArrowLeft, FaEdit, FaGamepad, FaClock, FaUsers, FaTrophy } from 'react-icons/fa';
import { IoStatsChart } from 'react-icons/io5';
import { MdQuiz } from 'react-icons/md';
import '../styles/admin.css';

function Analytics() {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<QuizTemplate | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [quizData, analyticsData] = await Promise.all([
        quizAPI.getQuiz(id),
        quizAPI.getAnalytics(id)
      ]);
      setQuiz(quizData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  if (!quiz || !analytics) {
    return (
      <div className="admin-container">
        <div className="error-message">Failed to load analytics</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <Link to="/admin/quizzes" className="btn-back"><FaArrowLeft /> Quiz Library</Link>
          <h1><IoStatsChart /> Analytics: {quiz.title}</h1>
        </div>
        <Link to={`/admin/quizzes/${id}`} className="btn-secondary">
          <FaEdit /> Edit Quiz
        </Link>
      </header>

      <div className="analytics-dashboard">
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon"><FaGamepad size={40} color="#667eea" /></div>
            <div className="stat-info">
              <div className="stat-value">{analytics.total_games}</div>
              <div className="stat-label">Total Games</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><FaClock size={40} color="#667eea" /></div>
            <div className="stat-info">
              <div className="stat-value">{formatDuration(analytics.avg_duration)}</div>
              <div className="stat-label">Avg Duration</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><FaUsers size={40} color="#667eea" /></div>
            <div className="stat-info">
              <div className="stat-value">{analytics.unique_hosts}</div>
              <div className="stat-label">Unique Hosts</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><MdQuiz size={40} color="#667eea" /></div>
            <div className="stat-info">
              <div className="stat-value">{quiz.question_count || 0}</div>
              <div className="stat-label">Questions</div>
            </div>
          </div>
        </div>

        <div className="analytics-section">
          <h2><FaTrophy /> Top Scores</h2>
          {analytics.top_scores.length === 0 ? (
            <div className="empty-state-small">
              <p>No games played yet!</p>
            </div>
          ) : (
            <div className="leaderboard-table">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Score</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.top_scores.map((score, index) => (
                    <tr key={index}>
                      <td className="rank-cell">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </td>
                      <td>{score.name}</td>
                      <td className="score-cell">{score.score} pts</td>
                      <td>{new Date(score.ended_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;

