import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaPlay, FaBook } from 'react-icons/fa';
import type { QuizTemplate } from '../services/api';
import { config } from '../config';
import { userAuthService } from '../services/userAuth';
import '../styles/admin.css';

function CreateGame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedQuizId = searchParams.get('quiz');

  const [quizzes, setQuizzes] = useState<QuizTemplate[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>(
    preselectedQuizId || ''
  );
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string>('');
  const [roomCode, setRoomCode] = useState<string>('');

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

      // Load both user's quizzes and public quizzes
      const [myQuizzesRes, publicQuizzesRes] = await Promise.all([
        fetch(`${config.API_URL}/api/user/quizzes`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${config.API_URL}/api/user/quizzes/public`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      if (!myQuizzesRes.ok || !publicQuizzesRes.ok) {
        throw new Error('Failed to load quizzes');
      }

      const myQuizzes = await myQuizzesRes.json();
      const publicQuizzes = await publicQuizzesRes.json();

      // Combine and deduplicate
      const allQuizzes = [...myQuizzes];
      const myQuizIds = new Set(myQuizzes.map((q: QuizTemplate) => q.id));

      for (const quiz of publicQuizzes) {
        if (!myQuizIds.has(quiz.id)) {
          allQuizzes.push(quiz);
        }
      }

      setQuizzes(allQuizzes);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateGame = async () => {
    if (!selectedQuizId) {
      setError('Please select a quiz');
      return;
    }

    try {
      setCreating(true);
      setError('');

      const user = userAuthService.getUser();
      const code = roomCode || generateRoomCode();

      // Create the game room
      const response = await fetch(`${config.API_URL}/api/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: user?.display_name || 'Host',
          quizId: selectedQuizId,
          roomCode: code,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create game room');
      }

      const result = await response.json();

      // Navigate to play page with room code and as admin
      navigate(`/play?room=${result.roomCode || code}&admin=true`);
    } catch (err) {
      console.error('Failed to create game:', err);
      setError('Failed to create game. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading quizzes...</div>
      </div>
    );
  }

  const selectedQuiz = quizzes.find(q => q.id === selectedQuizId);

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <Link to="/dashboard" className="btn-back">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <h1>
            <FaPlay /> Create New Game
          </h1>
        </div>
      </header>

      <div className="admin-dashboard">
        {error && <div className="error-message">{error}</div>}

        <div className="create-game-section">
          <div className="form-section">
            <h2>1. Select a Quiz</h2>

            {quizzes.length === 0 ? (
              <div className="empty-state-small">
                <FaBook size={48} color="#cbd5e1" />
                <p>No quizzes available. Create one first!</p>
                <Link to="/create-quiz" className="btn-primary">
                  Create Your First Quiz
                </Link>
              </div>
            ) : (
              <div className="quiz-selector">
                {quizzes.map(quiz => (
                  <div
                    key={quiz.id}
                    className={`quiz-select-card ${
                      selectedQuizId === quiz.id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedQuizId(quiz.id)}
                  >
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
                    </div>
                    {selectedQuizId === quiz.id && (
                      <div className="selected-badge">✓ Selected</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedQuiz && (
            <div className="form-section">
              <h2>2. Game Settings (Optional)</h2>
              <div className="form-group">
                <label>Custom Room Code (optional)</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Leave empty for random code"
                  maxLength={10}
                  style={{ textTransform: 'uppercase' }}
                />
                <small>If empty, a random code will be generated</small>
              </div>
            </div>
          )}

          {selectedQuiz && (
            <div className="form-section">
              <h2>3. Ready to Start?</h2>
              <div className="game-preview">
                <h3>Selected Quiz: {selectedQuiz.title}</h3>
                <p>{selectedQuiz.description}</p>
                <div className="preview-stats">
                  <span>📋 {selectedQuiz.question_count || 0} Questions</span>
                  <span>🎯 {selectedQuiz.difficulty}</span>
                  <span>📂 {selectedQuiz.category}</span>
                </div>
              </div>

              <button
                onClick={handleCreateGame}
                className="btn-primary btn-large"
                disabled={creating || !selectedQuizId}
              >
                <FaPlay />{' '}
                {creating ? 'Creating Game...' : 'Create Game & Get Room Code'}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .create-game-section {
          max-width: 900px;
          margin: 0 auto;
        }

        .form-section {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .form-section h2 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #1f2937;
        }

        .quiz-selector {
          display: grid;
          gap: 1rem;
        }

        .quiz-select-card {
          padding: 1.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .quiz-select-card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .quiz-select-card.selected {
          border-color: #667eea;
          background: #f5f7ff;
        }

        .selected-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #667eea;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .game-preview {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .game-preview h3 {
          margin-top: 0;
          color: #667eea;
        }

        .preview-stats {
          display: flex;
          gap: 1.5rem;
          margin-top: 1rem;
          font-size: 0.95rem;
        }

        .preview-stats span {
          color: #6b7280;
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          width: 100%;
        }
      `}</style>
    </div>
  );
}

export default CreateGame;
