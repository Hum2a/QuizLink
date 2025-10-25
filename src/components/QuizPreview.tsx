import React, { useState, useEffect } from 'react';
import {
  FaTimes,
  FaPlay,
  FaClock,
  FaQuestionCircle,
  FaTag,
} from 'react-icons/fa';
import type { QuizTemplate } from '../services/api';
import { quizAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

interface QuizPreviewProps {
  quiz: QuizTemplate;
  onClose: () => void;
  onPlay: () => void;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({ quiz, onClose, onPlay }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const data = await quizAPI.getQuestions(quiz.id);
        setQuestions(data || []);
      } catch (err) {
        setError('Failed to load questions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [quiz.id]);

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowAnswer(false);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'hard':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="quiz-preview-overlay">
        <div className="quiz-preview-modal">
          <LoadingSpinner message="Loading quiz preview..." size="medium" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-preview-overlay">
        <div className="quiz-preview-modal">
          <div className="error-state">
            <p>{error}</p>
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-preview-overlay">
      <div className="quiz-preview-modal">
        {/* Header */}
        <div className="preview-header">
          <div className="preview-title">
            <h2>{quiz.title}</h2>
            <div className="quiz-badges">
              <span
                className="difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(quiz.difficulty) }}
              >
                {quiz.difficulty}
              </span>
              {quiz.category && (
                <span className="category-badge">
                  <FaTag /> {quiz.category}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="close-btn">
            <FaTimes />
          </button>
        </div>

        {/* Quiz Info */}
        <div className="quiz-info">
          <p className="quiz-description">{quiz.description}</p>
          <div className="quiz-stats">
            <div className="stat">
              <FaQuestionCircle />
              <span>{questions.length} questions</span>
            </div>
            <div className="stat">
              <FaClock />
              <span>~{Math.ceil(questions.length * 0.5)} min</span>
            </div>
            <div className="stat">
              <FaPlay />
              <span>{quiz.times_played} plays</span>
            </div>
          </div>
        </div>

        {/* Question Preview */}
        {questions.length > 0 && (
          <div className="question-preview">
            <div className="preview-nav">
              <button
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className="nav-btn"
              >
                ← Previous
              </button>
              <span className="question-counter">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <button
                onClick={nextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className="nav-btn"
              >
                Next →
              </button>
            </div>

            <div className="question-content">
              <h3>{currentQuestion.question}</h3>

              <div className="options-preview">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`option-preview ${
                      showAnswer && currentQuestion.correct_answer === index
                        ? 'correct'
                        : ''
                    }`}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="option-text">{option}</span>
                    {showAnswer && currentQuestion.correct_answer === index && (
                      <span className="correct-indicator">✓</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="preview-actions">
                <button onClick={toggleAnswer} className="btn-secondary">
                  {showAnswer ? 'Hide Answer' : 'Show Answer'}
                </button>
              </div>

              {showAnswer && currentQuestion.explanation && (
                <div className="explanation">
                  <strong>Explanation:</strong>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="preview-actions-footer">
          <button onClick={onClose} className="btn-secondary">
            Close Preview
          </button>
          <button onClick={onPlay} className="btn-primary">
            <FaPlay /> Start Game
          </button>
        </div>

        <style>{`
          .quiz-preview-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 1rem;
          }

          .quiz-preview-modal {
            background: white;
            border-radius: 12px;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }

          .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
          }

          .preview-title h2 {
            margin: 0 0 0.5rem 0;
            color: #1f2937;
            font-size: 1.5rem;
          }

          .quiz-badges {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .difficulty-badge {
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: capitalize;
          }

          .category-badge {
            background: #f3f4f6;
            color: #374151;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 1.25rem;
            color: #6b7280;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 0.5rem;
            transition: background-color 0.2s;
          }

          .close-btn:hover {
            background: #f3f4f6;
          }

          .quiz-info {
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
          }

          .quiz-description {
            color: #4b5563;
            margin-bottom: 1rem;
            line-height: 1.6;
          }

          .quiz-stats {
            display: flex;
            gap: 1.5rem;
            flex-wrap: wrap;
          }

          .stat {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #6b7280;
            font-size: 0.875rem;
          }

          .question-preview {
            padding: 1.5rem;
          }

          .preview-nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }

          .nav-btn {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s;
          }

          .nav-btn:hover:not(:disabled) {
            background: #e5e7eb;
          }

          .nav-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .question-counter {
            font-weight: 500;
            color: #374151;
          }

          .question-content h3 {
            margin: 0 0 1.5rem 0;
            color: #1f2937;
            font-size: 1.25rem;
            line-height: 1.5;
          }

          .options-preview {
            margin-bottom: 1.5rem;
          }

          .option-preview {
            display: flex;
            align-items: center;
            padding: 1rem;
            margin-bottom: 0.75rem;
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            border-radius: 0.75rem;
            transition: all 0.2s;
          }

          .option-preview.correct {
            background: #f0fdf4;
            border-color: #10b981;
          }

          .option-letter {
            background: #e5e7eb;
            color: #374151;
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            margin-right: 1rem;
            flex-shrink: 0;
          }

          .option-preview.correct .option-letter {
            background: #10b981;
            color: white;
          }

          .option-text {
            flex: 1;
            color: #374151;
          }

          .correct-indicator {
            color: #10b981;
            font-weight: 600;
            font-size: 1.25rem;
          }

          .preview-actions {
            margin-bottom: 1rem;
          }

          .explanation {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-top: 1rem;
          }

          .explanation strong {
            color: #0369a1;
            display: block;
            margin-bottom: 0.5rem;
          }

          .explanation p {
            margin: 0;
            color: #0c4a6e;
            line-height: 1.5;
          }

          .preview-actions-footer {
            display: flex;
            justify-content: space-between;
            padding: 1.5rem;
            border-top: 1px solid #e5e7eb;
            gap: 1rem;
          }

          .btn-primary, .btn-secondary {
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            border: none;
          }

          .btn-primary {
            background: #3b82f6;
            color: white;
          }

          .btn-primary:hover {
            background: #2563eb;
          }

          .btn-secondary {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
          }

          .btn-secondary:hover {
            background: #e5e7eb;
          }

          .error-state {
            text-align: center;
            padding: 2rem;
            color: #ef4444;
          }

          @media (max-width: 640px) {
            .quiz-preview-modal {
              margin: 0.5rem;
              max-height: calc(100vh - 1rem);
            }

            .preview-header {
              flex-direction: column;
              gap: 1rem;
            }

            .quiz-stats {
              flex-direction: column;
              gap: 0.75rem;
            }

            .preview-nav {
              flex-direction: column;
              gap: 1rem;
            }

            .preview-actions-footer {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default QuizPreview;
