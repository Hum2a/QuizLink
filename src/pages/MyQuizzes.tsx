import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaPlay,
  FaArrowLeft,
  FaBook,
} from 'react-icons/fa';
import type { QuizTemplate } from '../services/api';
import { config } from '../config';
import { userAuthService } from '../services/userAuth';
import '../styles/admin.css';

function MyQuizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuizTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const token = userAuthService.getToken();

      if (!token) {
        navigate('/register');
        return;
      }

      const response = await fetch(`${config.API_URL}/api/user/quizzes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load quizzes');
      }

      const data = await response.json();
      setQuizzes(data);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      setError('Failed to load your quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const token = userAuthService.getToken();
      const response = await fetch(`${config.API_URL}/api/user/quizzes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }

      await loadQuizzes();
    } catch (err) {
      console.error('Failed to delete quiz:', err);
      alert('Failed to delete quiz');
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading your quizzes...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <Link to="/dashboard" className="btn-back">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <h1>
            <FaBook /> My Quizzes
          </h1>
        </div>
        <Link to="/create-quiz" className="btn-primary">
          <FaPlus /> Create New Quiz
        </Link>
      </header>

      <div className="admin-dashboard">
        {error && <div className="error-message">{error}</div>}

        {quizzes.length === 0 ? (
          <div className="empty-state">
            <FaBook size={64} color="#cbd5e1" />
            <h2>No Quizzes Yet</h2>
            <p>Create your first quiz to get started!</p>
            <Link to="/create-quiz" className="btn-primary">
              <FaPlus /> Create Your First Quiz
            </Link>
          </div>
        ) : (
          <div className="quiz-grid">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="quiz-card">
                <div className="quiz-header">
                  <h3>{quiz.title}</h3>
                  <span
                    className={`difficulty-badge difficulty-${quiz.difficulty}`}
                  >
                    {quiz.difficulty}
                  </span>
                </div>

                <p className="quiz-description">{quiz.description}</p>

                <div className="quiz-meta">
                  <span className="quiz-category">{quiz.category}</span>
                  <span className="quiz-stat">
                    {quiz.question_count || 0} questions
                  </span>
                  <span className="quiz-stat">
                    Played {quiz.times_played} times
                  </span>
                </div>

                <div className="quiz-actions">
                  <Link
                    to={`/create-game?quiz=${quiz.id}`}
                    className="btn-sm btn-primary"
                    title="Start a game with this quiz"
                  >
                    <FaPlay /> Play
                  </Link>
                  <Link
                    to={`/edit-quiz/${quiz.id}`}
                    className="btn-sm btn-secondary"
                  >
                    <FaEdit /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(quiz.id, quiz.title)}
                    className="btn-sm btn-danger"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyQuizzes;
