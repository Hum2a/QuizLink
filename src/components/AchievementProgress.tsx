import React from 'react';
import { FaTrophy, FaStar, FaFire } from 'react-icons/fa';
import { useAchievements } from '../contexts/AchievementContext';

interface AchievementProgressProps {
  className?: string;
  showStats?: boolean;
  showRecent?: boolean;
}

const AchievementProgress: React.FC<AchievementProgressProps> = ({
  className = '',
  showStats = true,
  showRecent = true,
}) => {
  const {
    unlockedCount,
    totalCount,
    totalPoints,
    getRecentUnlocks,
    unlockedAchievements,
  } = useAchievements();

  const progressPercentage = (unlockedCount / totalCount) * 100;
  const recentUnlocks = getRecentUnlocks(3);

  return (
    <div className={`achievement-progress ${className}`}>
      {showStats && (
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">
              <FaTrophy />
            </div>
            <div className="stat-content">
              <div className="stat-value">{unlockedCount}</div>
              <div className="stat-label">Achievements</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaStar />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalPoints}</div>
              <div className="stat-label">Total Points</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaFire />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {Math.round(progressPercentage)}%
              </div>
              <div className="stat-label">Complete</div>
            </div>
          </div>
        </div>
      )}

      <div className="progress-section">
        <div className="progress-header">
          <h3>Overall Progress</h3>
          <span className="progress-text">
            {unlockedCount} of {totalCount} achievements unlocked
          </span>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="progress-percentage">
            {Math.round(progressPercentage)}%
          </div>
        </div>
      </div>

      {showRecent && recentUnlocks.length > 0 && (
        <div className="recent-section">
          <h3>Recent Unlocks</h3>
          <div className="recent-list">
            {recentUnlocks.map((unlock, index) => (
              <div key={unlock.achievementId} className="recent-item">
                <div className="recent-icon">🏆</div>
                <div className="recent-content">
                  <div className="recent-title">Achievement Unlocked!</div>
                  <div className="recent-time">
                    {unlock.unlockedAt.toLocaleDateString()}
                  </div>
                </div>
                <div className="recent-badge">#{index + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .achievement-progress {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }

        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--color-background-secondary);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          transition: all var(--transition-fast);
        }

        .stat-card:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: var(--color-primary-light);
          color: var(--color-primary);
          border-radius: var(--radius-md);
          font-size: 1.25rem;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin-top: 0.25rem;
        }

        .progress-section {
          margin-bottom: 2rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .progress-header h3 {
          margin: 0;
          color: var(--color-text-primary);
          font-size: 1.125rem;
        }

        .progress-text {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }

        .progress-bar-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .progress-bar {
          flex: 1;
          height: 1rem;
          background: var(--color-border);
          border-radius: var(--radius-full);
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary), var(--color-primary-hover));
          border-radius: var(--radius-full);
          transition: width var(--transition-normal);
          position: relative;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }

        .progress-percentage {
          font-weight: 600;
          color: var(--color-text-primary);
          font-size: 0.875rem;
          min-width: 3rem;
          text-align: right;
        }

        .recent-section h3 {
          margin: 0 0 1rem 0;
          color: var(--color-text-primary);
          font-size: 1.125rem;
        }

        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .recent-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--color-background-secondary);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          transition: all var(--transition-fast);
        }

        .recent-item:hover {
          background: var(--color-surface-hover);
        }

        .recent-icon {
          font-size: 1.5rem;
          width: 2rem;
          text-align: center;
        }

        .recent-content {
          flex: 1;
        }

        .recent-title {
          font-weight: 600;
          color: var(--color-text-primary);
          font-size: 0.875rem;
        }

        .recent-time {
          color: var(--color-text-secondary);
          font-size: 0.75rem;
          margin-top: 0.125rem;
        }

        .recent-badge {
          background: var(--color-primary);
          color: var(--color-text-inverse);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .achievement-progress {
            padding: 1rem;
          }

          .stats-section {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .stat-card {
            padding: 0.75rem;
          }

          .progress-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .progress-bar-container {
            flex-direction: column;
            gap: 0.5rem;
          }

          .progress-percentage {
            text-align: left;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default AchievementProgress;
