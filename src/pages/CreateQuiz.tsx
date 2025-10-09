import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaSave, FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { config } from '../config';
import { userAuthService } from '../services/userAuth';
import QuestionForm from '../components/QuestionForm';
import type { Question } from '../services/api';
import '../styles/admin.css';

interface QuizFormData {
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  is_public: boolean;
}

function CreateQuiz() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [formData, setFormData] = useState<QuizFormData>({
    title: '',
    description: '',
    category: '',
    difficulty: 'medium',
    is_public: true,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isEditing) {
      loadQuiz();
    }
  }, [id]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const token = userAuthService.getToken();

      const [quizRes, questionsRes] = await Promise.all([
        fetch(`${config.API_URL}/api/user/quizzes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${config.API_URL}/api/user/quizzes/${id}/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!quizRes.ok || !questionsRes.ok) {
        throw new Error('Failed to load quiz');
      }

      const quiz = await quizRes.json();
      const questionsData = await questionsRes.json();

      setFormData({
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        is_public: quiz.is_public,
      });

      setQuestions(questionsData);
    } catch (err) {
      console.error('Failed to load quiz:', err);
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Quiz title is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const token = userAuthService.getToken();

      const url = isEditing
        ? `${config.API_URL}/api/user/quizzes/${id}`
        : `${config.API_URL}/api/user/quizzes`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save quiz');
      }

      const result = await response.json();

      if (!isEditing) {
        // Redirect to edit page after creation to add questions
        navigate(`/edit-quiz/${result.id}`);
      } else {
        alert('Quiz saved successfully!');
      }
    } catch (err) {
      console.error('Failed to save quiz:', err);
      setError('Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const handleSaveQuestion = async (
    questionData: Omit<Question, 'id' | 'quiz_template_id'>
  ) => {
    try {
      const token = userAuthService.getToken();

      if (editingQuestion) {
        // Update existing question
        const response = await fetch(
          `${config.API_URL}/api/user/questions/${editingQuestion.id}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(questionData),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update question');
        }
      } else {
        // Add new question
        const response = await fetch(
          `${config.API_URL}/api/user/quizzes/${id}/questions`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(questionData),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to add question');
        }
      }

      setShowQuestionForm(false);
      setEditingQuestion(null);
      await loadQuiz();
    } catch (err) {
      console.error('Failed to save question:', err);
      alert('Failed to save question');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const token = userAuthService.getToken();
      const response = await fetch(
        `${config.API_URL}/api/user/questions/${questionId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      await loadQuiz();
    } catch (err) {
      console.error('Failed to delete question:', err);
      alert('Failed to delete question');
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading quiz...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <Link to="/my-quizzes" className="btn-back">
            <FaArrowLeft /> Back to My Quizzes
          </Link>
          <h1>{isEditing ? 'Edit Quiz' : 'Create New Quiz'}</h1>
        </div>
      </header>

      <div className="admin-dashboard">
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="quiz-form">
          <div className="form-group">
            <label>Quiz Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the quiz"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={e =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., General Knowledge, Science"
              />
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={e =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as any,
                  })
                }
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={e =>
                  setFormData({ ...formData, is_public: e.target.checked })
                }
              />
              <span>Make this quiz public (others can play it)</span>
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            <FaSave /> {saving ? 'Saving...' : 'Save Quiz Info'}
          </button>
        </form>

        {isEditing && (
          <div className="questions-section">
            <div className="section-header">
              <h2>Questions ({questions.length})</h2>
              <button onClick={handleAddQuestion} className="btn-primary">
                <FaPlus /> Add Question
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="empty-state-small">
                <p>No questions yet. Add your first question!</p>
              </div>
            ) : (
              <div className="questions-list">
                {questions.map((question, index) => (
                  <div key={question.id} className="question-item">
                    <div className="question-number">#{index + 1}</div>
                    <div className="question-content">
                      <h4>{question.question_text}</h4>
                      <div className="question-options">
                        {question.options.map((option, idx) => (
                          <span
                            key={idx}
                            className={`option-badge ${
                              idx === question.correct_answer ? 'correct' : ''
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}) {option}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="question-actions">
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="btn-sm btn-secondary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
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
        )}

        {showQuestionForm && (
          <QuestionForm
            question={editingQuestion}
            onSave={handleSaveQuestion}
            onCancel={() => {
              setShowQuestionForm(false);
              setEditingQuestion(null);
            }}
            nextDisplayOrder={questions.length + 1}
          />
        )}
      </div>

      <style>{`
        .quiz-form {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          margin-bottom: 0;
        }

        .checkbox-label input[type="checkbox"] {
          width: auto;
          margin: 0;
          padding: 0;
          transform: scale(1.2);
        }

        .questions-section {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h2 {
          margin: 0;
          color: #1f2937;
        }

        .questions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .question-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
        }

        .question-number {
          background: #667eea;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .question-content {
          flex: 1;
        }

        .question-content h4 {
          margin: 0 0 0.75rem 0;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .question-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .option-badge {
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          background: white;
          border: 1px solid #e5e7eb;
          font-size: 0.875rem;
        }

        .option-badge.correct {
          background: #dcfce7;
          border-color: #22c55e;
          color: #166534;
        }

        .question-actions {
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
        }

        .btn-sm {
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-sm.btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-sm.btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-sm.btn-danger {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .btn-sm.btn-danger:hover {
          background: #fee2e2;
        }

        .empty-state-small {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }

        .empty-state-small p {
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}

export default CreateQuiz;
