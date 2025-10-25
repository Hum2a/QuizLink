import React from 'react';
import { FaTrophy, FaLock, FaCheck } from 'react-icons/fa';
import { useAchievements } from '../contexts/AchievementContext';
import {
  getRarityColor,
  getRarityGradient,
  type Achievement,
} from '../types/achievements';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  showPoints?: boolean;
  className?: string;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  showProgress = false,
  showPoints = false,
  className = '',
}) => {
  const { isUnlocked, getProgress } = useAchievements();

  const isUnlockedAchievement = isUnlocked(achievement.id);
  const progress = getProgress(achievement.id);
  const progressPercentage = achievement.requirements[0]
    ? (progress / achievement.requirements[0].value) * 100
    : 0;

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-20 h-20 text-lg',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`achievement-badge ${className}`}>
      <div
        className={`badge-container ${sizeClasses[size]} ${
          isUnlockedAchievement ? 'unlocked' : 'locked'
        }`}
        style={{
          background: isUnlockedAchievement
            ? getRarityGradient(achievement.rarity)
            : 'linear-gradient(135deg, #6b7280, #9ca3af)',
        }}
      >
        {isUnlockedAchievement ? (
          <div className="badge-content unlocked">
            <span className="achievement-icon">{achievement.icon}</span>
            <div className="unlock-indicator">
              <FaCheck />
            </div>
          </div>
        ) : (
          <div className="badge-content locked">
            <span className="achievement-icon">{achievement.icon}</span>
            <div className="lock-indicator">
              <FaLock />
            </div>
          </div>
        )}
      </div>

      <div className="badge-info">
        <h3 className={`achievement-title ${textSizeClasses[size]}`}>
          {achievement.title}
        </h3>
        <p className={`achievement-description ${textSizeClasses[size]}`}>
          {achievement.description}
        </p>

        {showProgress && !isUnlockedAchievement && (
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="progress-text">
              {progress} / {achievement.requirements[0]?.value || 1}
            </span>
          </div>
        )}

        {showPoints && (
          <div className="points-container">
            <FaTrophy className="points-icon" />
            <span className="points-text">{achievement.points} pts</span>
          </div>
        )}

        <div className="rarity-indicator">
          <span
            className="rarity-badge"
            style={{ backgroundColor: getRarityColor(achievement.rarity) }}
          >
            {achievement.rarity}
          </span>
        </div>
      </div>

      <style>{`
        .achievement-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          transition: all var(--transition-normal);
          position: relative;
          overflow: hidden;
        }

        .achievement-badge:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          border-color: var(--color-border-hover);
        }

        .badge-container {
          position: relative;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-md);
          transition: all var(--transition-normal);
        }

        .badge-container.unlocked {
          animation: pulse 2s infinite;
        }

        .badge-container.locked {
          opacity: 0.6;
          filter: grayscale(0.3);
        }

        .badge-content {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .achievement-icon {
          font-size: 1.5em;
          z-index: 2;
        }

        .unlock-indicator,
        .lock-indicator {
          position: absolute;
          top: -2px;
          right: -2px;
          background: var(--color-success);
          color: var(--color-text-inverse);
          border-radius: 50%;
          width: 1.5rem;
          height: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          box-shadow: var(--shadow-sm);
        }

        .lock-indicator {
          background: var(--color-text-tertiary);
        }

        .badge-info {
          text-align: center;
          width: 100%;
        }

        .achievement-title {
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0 0 0.25rem 0;
        }

        .achievement-description {
          color: var(--color-text-secondary);
          margin: 0 0 0.75rem 0;
          line-height: 1.4;
        }

        .progress-container {
          margin-bottom: 0.75rem;
        }

        .progress-bar {
          width: 100%;
          height: 0.5rem;
          background: var(--color-border);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: 0.25rem;
        }

        .progress-fill {
          height: 100%;
          background: var(--color-primary);
          border-radius: var(--radius-full);
          transition: width var(--transition-normal);
        }

        .progress-text {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .points-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .points-icon {
          color: var(--color-warning);
          font-size: 0.875rem;
        }

        .points-text {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          font-weight: 600;
        }

        .rarity-indicator {
          display: flex;
          justify-content: center;
        }

        .rarity-badge {
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius-full);
          color: var(--color-text-inverse);
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .achievement-badge {
            padding: 0.75rem;
          }

          .badge-container {
            box-shadow: var(--shadow-sm);
          }
        }
      `}</style>
    </div>
  );
};

export default AchievementBadge;
