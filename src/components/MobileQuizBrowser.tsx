import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaEye, FaClock, FaUsers, FaStar, FaFilter, FaSearch } from 'react-icons/fa';
import { useTouchGestures, type TouchGesture } from '../hooks/useTouchGestures';
import QuizPreview from './QuizPreview';
import LoadingSpinner from './LoadingSpinner';
import type { Quiz } from '../types/quiz';

interface MobileQuizBrowserProps {
  quizzes: Quiz[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const MobileQuizBrowser: React.FC<MobileQuizBrowserProps> = ({
  quizzes,
  loading = false,
  onLoadMore,
  hasMore = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>(quizzes);
  const [showFilters, setShowFilters] = useState(false);
  const [gestureFeedback, setGestureFeedback] = useState<string | null>(null);

  // Update filtered quizzes when quizzes or filters change
  useEffect(() => {
    let filtered = quizzes;

    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(quiz => quiz.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(quiz => quiz.difficulty === selectedDifficulty);
    }

    setFilteredQuizzes(filtered);
  }, [quizzes, searchTerm, selectedCategory, selectedDifficulty]);

  const handleGesture = useCallback((gesture: TouchGesture) => {
    switch (gesture.type) {
      case 'swipe-down':
        setShowFilters(true);
        setGestureFeedback('Filters opened');
        setTimeout(() => setGestureFeedback(null), 1000);
        break;
      case 'swipe-up':
        setShowFilters(false);
        setGestureFeedback('Filters closed');
        setTimeout(() => setGestureFeedback(null), 1000);
        break;
      case 'long-press':
        setGestureFeedback('Long press detected');
        setTimeout(() => setGestureFeedback(null), 1000);
        break;
    }
  }, []);

  const { elementRef } = useTouchGestures(handleGesture, {
    swipeThreshold: 30,
    preventDefault: false,
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'var(--color-success)';
      case 'medium': return 'var(--color-warning)';
      case 'hard': return 'var(--color-error)';
      default: return 'var(--color-text-secondary)';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  const categories = ['all', ...Array.from(new Set(quizzes.map(q => q.category).filter(Boolean)))];
  const difficulties = ['all', 'easy', 'medium', 'hard'];

  if (loading && quizzes.length === 0) {
    return (
      <div className="mobile-quiz-browser">
        <LoadingSpinner message="Loading quizzes..." size="large" />
      </div>
    );
  }

  return (
    <div className="mobile-quiz-browser" ref={elementRef}>
      {/* Header */}
      <div className="browser-header">
        <h1>📱 Quiz Browser</h1>
        <p>Swipe down for filters, tap to play!</p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="filters-section">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Difficulty:</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="filter-select"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty === 'all' ? 'All Difficulties' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Quiz Grid */}
      <div className="quiz-grid">
        {filteredQuizzes.map((quiz) => (
          <div key={quiz.id} className="quiz-card">
            <div className="quiz-header">
              <h3 className="quiz-title">{quiz.title}</h3>
              <div className="quiz-meta">
                <span className="difficulty-badge" style={{ color: getDifficultyColor(quiz.difficulty) }}>
                  {getDifficultyIcon(quiz.difficulty)} {quiz.difficulty}
                </span>
                {quiz.category && (
                  <span className="category-badge">{quiz.category}</span>
                )}
              </div>
            </div>

            <div className="quiz-content">
              <p className="quiz-description">
                {quiz.description || 'No description available'}
              </p>

              <div className="quiz-stats">
                <div className="stat">
                  <FaUsers />
                  <span>{quiz.question_count || 0} questions</span>
                </div>
                {quiz.time_limit && (
                  <div className="stat">
                    <FaClock />
                    <span>{quiz.time_limit}s</span>
                  </div>
                )}
                <div className="stat">
                  <FaStar />
                  <span>{quiz.play_count || 0} plays</span>
                </div>
              </div>
            </div>

            <div className="quiz-actions">
              <button
                className="preview-btn"
                onClick={() => setPreviewQuiz(quiz)}
              >
                <FaEye /> Preview
              </button>
              <Link
                to={`/play/${quiz.id}`}
                className="play-btn"
              >
                <FaPlay /> Play
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="load-more-section">
          <button
            className="load-more-btn"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredQuizzes.length === 0 && !loading && (
        <div className="empty-state">
          <h3>No quizzes found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}

      {/* Gesture Feedback */}
      {gestureFeedback && (
        <div className="gesture-feedback">
          {gestureFeedback}
        </div>
      )}

      {/* Quiz Preview Modal */}
      {previewQuiz && (
        <QuizPreview
          quiz={previewQuiz}
          onClose={() => setPreviewQuiz(null)}
        />
      )}

      <style>{`
        .mobile-quiz-browser {
          min-height: 100vh;
          background: var(--color-background);
          padding: 1rem;
        }

        .browser-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .browser-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 0.5rem 0;
        }

        .browser-header p {
          color: var(--color-text-secondary);
          margin: 0;
        }

        .search-section {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .search-bar {
          flex: 1;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-tertiary);
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 2.5rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          background: var(--color-surface);
          color: var(--color-text-primary);
          font-size: 1rem;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-border-focus);
          box-shadow: 0 0 0 3px var(--color-primary-light);
        }

        .filter-toggle {
          padding: 1rem;
          background: var(--color-primary);
          color: var(--color-text-inverse);
          border: none;
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-toggle:hover {
          background: var(--color-primary-hover);
          transform: translateY(-2px);
        }

        .filters-section {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin-bottom: 2rem;
          animation: slideDown 0.3s ease-out;
        }

        .filter-group {
          margin-bottom: 1rem;
        }

        .filter-group:last-child {
          margin-bottom: 0;
        }

        .filter-group label {
          display: block;
          color: var(--color-text-secondary);
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .filter-select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-background);
          color: var(--color-text-primary);
        }

        .quiz-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .quiz-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          transition: all var(--transition-normal);
        }

        .quiz-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .quiz-header {
          margin-bottom: 1rem;
        }

        .quiz-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0 0 0.5rem 0;
        }

        .quiz-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .difficulty-badge,
        .category-badge {
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .difficulty-badge {
          background: var(--color-background-secondary);
        }

        .category-badge {
          background: var(--color-primary-light);
          color: var(--color-primary);
        }

        .quiz-content {
          margin-bottom: 1.5rem;
        }

        .quiz-description {
          color: var(--color-text-secondary);
          margin: 0 0 1rem 0;
          line-height: 1.5;
        }

        .quiz-stats {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }

        .quiz-actions {
          display: flex;
          gap: 1rem;
        }

        .preview-btn,
        .play-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all var(--transition-fast);
          cursor: pointer;
          text-decoration: none;
        }

        .preview-btn {
          background: var(--color-secondary-light);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
        }

        .preview-btn:hover {
          background: var(--color-secondary-hover);
          color: var(--color-text-inverse);
        }

        .play-btn {
          background: var(--color-primary);
          color: var(--color-text-inverse);
          border: 1px solid var(--color-primary);
        }

        .play-btn:hover {
          background: var(--color-primary-hover);
          border-color: var(--color-primary-hover);
          transform: translateY(-2px);
        }

        .load-more-section {
          text-align: center;
          margin-top: 2rem;
        }

        .load-more-btn {
          padding: 1rem 2rem;
          background: var(--color-surface);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .load-more-btn:hover:not(:disabled) {
          background: var(--color-surface-hover);
          transform: translateY(-2px);
        }

        .load-more-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--color-text-secondary);
        }

        .empty-state h3 {
          color: var(--color-text-primary);
          margin: 0 0 0.5rem 0;
        }

        .gesture-feedback {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: var(--color-primary);
          color: var(--color-text-inverse);
          padding: 1rem 2rem;
          border-radius: var(--radius-lg);
          font-weight: 600;
          z-index: 1000;
          animation: fadeInOut 1s ease-in-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
        }

        @media (max-width: 480px) {
          .mobile-quiz-browser {
            padding: 0.75rem;
          }

          .quiz-actions {
            flex-direction: column;
          }

          .quiz-stats {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileQuizBrowser;
