import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaPlay,
  FaEye,
  FaClock,
  FaUsers,
  FaStar,
  FaThumbsUp,
} from 'react-icons/fa';
import {
  getRecommendationReasonIcon,
  getRecommendationReasonColor,
  type Recommendation,
} from '../services/recommendationEngine';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onPreview?: (quizId: string) => void;
  className?: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onPreview,
  className = '',
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'var(--color-success)';
      case 'medium':
        return 'var(--color-warning)';
      case 'hard':
        return 'var(--color-error)';
      default:
        return 'var(--color-text-secondary)';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '🟢';
      case 'medium':
        return '🟡';
      case 'hard':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div className={`recommendation-card ${className}`}>
      {/* Recommendation Header */}
      <div className="recommendation-header">
        <div className="recommendation-reason">
          <span
            className="reason-icon"
            style={{
              color: getRecommendationReasonColor(recommendation.reason),
            }}
          >
            {getRecommendationReasonIcon(recommendation.reason)}
          </span>
          <span className="reason-text">
            {recommendation.reason.description}
          </span>
        </div>
        <div className="recommendation-score">
          <FaThumbsUp className="score-icon" />
          <span className="score-text">{recommendation.score}%</span>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="quiz-content">
        <h3 className="quiz-title">{recommendation.quizTitle}</h3>

        <div className="quiz-meta">
          <span
            className="difficulty-badge"
            style={{ color: getDifficultyColor(recommendation.difficulty) }}
          >
            {getDifficultyIcon(recommendation.difficulty)}{' '}
            {recommendation.difficulty}
          </span>
          <span className="category-badge">{recommendation.category}</span>
        </div>

        {recommendation.topics.length > 0 && (
          <div className="quiz-topics">
            <span className="topics-label">Topics:</span>
            <div className="topics-list">
              {recommendation.topics.slice(0, 3).map((topic, index) => (
                <span key={index} className="topic-tag">
                  {topic}
                </span>
              ))}
              {recommendation.topics.length > 3 && (
                <span className="topic-more">
                  +{recommendation.topics.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <p className="recommendation-explanation">
          {recommendation.explanation}
        </p>
      </div>

      {/* Actions */}
      <div className="quiz-actions">
        {onPreview && (
          <button
            className="preview-btn"
            onClick={() => onPreview(recommendation.quizId)}
          >
            <FaEye /> Preview
          </button>
        )}
        <Link to={`/play/${recommendation.quizId}`} className="play-btn">
          <FaPlay /> Play Quiz
        </Link>
      </div>

      <style>{`
        .recommendation-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          transition: all var(--transition-normal);
          position: relative;
          overflow: hidden;
        }

        .recommendation-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          border-color: var(--color-border-hover);
        }

        .recommendation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--color-border);
        }

        .recommendation-reason {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .reason-icon {
          font-size: 1.25rem;
        }

        .reason-text {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .recommendation-score {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: var(--color-primary-light);
          color: var(--color-primary);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .score-icon {
          font-size: 0.75rem;
        }

        .quiz-content {
          margin-bottom: 1.5rem;
        }

        .quiz-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0 0 0.75rem 0;
          line-height: 1.3;
        }

        .quiz-meta {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
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
          background: var(--color-secondary-light);
          color: var(--color-secondary);
        }

        .quiz-topics {
          margin-bottom: 0.75rem;
        }

        .topics-label {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          margin-right: 0.5rem;
        }

        .topics-list {
          display: inline-flex;
          gap: 0.25rem;
          flex-wrap: wrap;
        }

        .topic-tag {
          background: var(--color-info-light);
          color: var(--color-info);
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .topic-more {
          color: var(--color-text-tertiary);
          font-size: 0.75rem;
          font-style: italic;
        }

        .recommendation-explanation {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          line-height: 1.4;
          margin: 0;
          font-style: italic;
        }

        .quiz-actions {
          display: flex;
          gap: 0.75rem;
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
          font-size: 0.875rem;
        }

        .preview-btn {
          background: var(--color-secondary-light);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
        }

        .preview-btn:hover {
          background: var(--color-secondary-hover);
          color: var(--color-text-inverse);
          transform: translateY(-1px);
        }

        .play-btn {
          background: var(--color-primary);
          color: var(--color-text-inverse);
          border: 1px solid var(--color-primary);
        }

        .play-btn:hover {
          background: var(--color-primary-hover);
          border-color: var(--color-primary-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .recommendation-card {
            padding: 1rem;
          }

          .recommendation-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .quiz-actions {
            flex-direction: column;
          }

          .topics-list {
            margin-top: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RecommendationCard;
