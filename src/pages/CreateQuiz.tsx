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
          />
        )}
      </div>
    </div>
  );
}

export default CreateQuiz;
