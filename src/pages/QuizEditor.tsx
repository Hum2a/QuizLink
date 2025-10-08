import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizAPI } from '../services/api';
import type { QuizTemplate, Question } from '../services/api';
import QuestionForm from '../components/QuestionForm';
import { FaPlusCircle, FaSave, FaArrowLeft, FaEdit, FaArrowUp, FaArrowDown, FaTrash } from 'react-icons/fa';
import { MdQuiz } from 'react-icons/md';
import '../styles/admin.css';

function QuizEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewQuiz = id === 'new';

  const [quiz, setQuiz] = useState<Partial<QuizTemplate>>({
    title: '',
    description: '',
    category: '',
    difficulty: 'medium',
    is_public: true
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    if (!isNewQuiz && id) {
      loadQuiz();
      loadQuestions();
    }
  }, [id]);

  const loadQuiz = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await quizAPI.getQuiz(id);
      setQuiz(data);
    } catch (err) {
      alert('Failed to load quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    if (!id) return;
    try {
      const data = await quizAPI.getQuestions(id);
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    }
  };

  const handleSaveQuiz = async () => {
    if (!quiz.title || !quiz.category) {
      alert('Please fill in title and category');
      return;
    }

    try {
      setSaving(true);
      
      if (isNewQuiz) {
        const { id: newId } = await quizAPI.createQuiz(quiz as any);
        navigate(`/admin/quizzes/${newId}`);
      } else if (id) {
        await quizAPI.updateQuiz(id, quiz);
        alert('Quiz updated successfully!');
      }
    } catch (err) {
      alert('Failed to save quiz');
      console.error(err);
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

  const handleSaveQuestion = async (question: Omit<Question, 'id' | 'quiz_template_id'>) => {
    if (!id || isNewQuiz) {
      alert('Please save the quiz first before adding questions');
      return;
    }

    try {
      if (editingQuestion) {
        await quizAPI.updateQuestion(editingQuestion.id, question);
      } else {
        await quizAPI.addQuestion(id, question);
      }
      
      setShowQuestionForm(false);
      setEditingQuestion(null);
      loadQuestions();
    } catch (err) {
      alert('Failed to save question');
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Delete this question?')) return;
    
    try {
      await quizAPI.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err) {
      alert('Failed to delete question');
      console.error(err);
    }
  };

  const moveQuestion = async (index: number, direction: 'up' | 'down') => {
    if (!id || isNewQuiz) return;
    
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;
    
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    
    setQuestions(newQuestions);
    
    try {
      await quizAPI.reorderQuestions(id, newQuestions.map(q => q.id));
    } catch (err) {
      console.error('Failed to reorder:', err);
      loadQuestions(); // Reload on error
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
          <Link to="/admin/quizzes" className="btn-back"><FaArrowLeft /> Quiz Library</Link>
          <h1>{isNewQuiz ? <><FaPlusCircle /> Create New Quiz</> : <><FaEdit /> Edit Quiz</>}</h1>
        </div>
      </header>

      <div className="quiz-editor">
        <div className="editor-section">
          <h2>Quiz Details</h2>
          
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={quiz.title}
              onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
              placeholder="Enter quiz title..."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={quiz.description}
              onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
              placeholder="Describe your quiz..."
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <input
                type="text"
                value={quiz.category}
                onChange={(e) => setQuiz({ ...quiz, category: e.target.value })}
                placeholder="e.g., General Knowledge"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={quiz.difficulty}
                onChange={(e) => setQuiz({ ...quiz, difficulty: e.target.value as any })}
                className="form-select"
                aria-label="Select difficulty level"
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
                checked={quiz.is_public}
                onChange={(e) => setQuiz({ ...quiz, is_public: e.target.checked })}
              />
              <span>Make quiz public</span>
            </label>
          </div>

          <button 
            onClick={handleSaveQuiz} 
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : <><FaSave /> Save Quiz</>}
          </button>
        </div>

        {!isNewQuiz && (
          <div className="editor-section">
            <div className="section-header">
              <h2><MdQuiz /> Questions ({questions.length})</h2>
              <button onClick={handleAddQuestion} className="btn-primary">
                <FaPlusCircle /> Add Question
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
                    <div className="question-number">{index + 1}</div>
                    <div className="question-content">
                      <div className="question-text">{question.question_text}</div>
                      <div className="question-options">
                        {question.options.map((opt, i) => (
                          <span 
                            key={i} 
                            className={`option-tag ${i === question.correct_answer ? 'correct' : ''}`}
                          >
                            {String.fromCharCode(65 + i)}. {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="question-actions">
                      <button 
                        onClick={() => moveQuestion(index, 'up')}
                        disabled={index === 0}
                        className="btn-icon"
                        title="Move up"
                      >
                        <FaArrowUp />
                      </button>
                      <button 
                        onClick={() => moveQuestion(index, 'down')}
                        disabled={index === questions.length - 1}
                        className="btn-icon"
                        title="Move down"
                      >
                        <FaArrowDown />
                      </button>
                      <button 
                        onClick={() => handleEditQuestion(question)}
                        className="btn-icon"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="btn-icon btn-danger"
                        title="Delete"
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
      </div>

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
  );
}

export default QuizEditor;

