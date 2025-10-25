import React, { useState } from 'react';
import {
  FaUserPlus,
  FaUserMinus,
  FaCheck,
  FaTimes,
  FaTrophy,
  FaStar,
  FaFire,
  FaClock,
} from 'react-icons/fa';
import { useSocial } from '../contexts/SocialContext';
import {
  getActivityIcon,
  getActivityColor,
  type SocialActivity,
  type LeaderboardEntry,
} from '../services/databaseSocialService';

interface SocialActivityCardProps {
  activity: SocialActivity;
  className?: string;
}

export const SocialActivityCard: React.FC<SocialActivityCardProps> = ({
  activity,
  className = '',
}) => {
  const getActivityMessage = (activity: SocialActivity): string => {
    switch (activity.type) {
      case 'quiz_completed':
        return `completed "${activity.data.quizTitle}" with ${activity.data.score}%`;
      case 'achievement_unlocked':
        return `unlocked achievement "${activity.data.achievementTitle}"`;
      case 'friend_added':
        return `became friends with ${activity.data.friendName}`;
      case 'high_score':
        return `achieved a new high score of ${activity.data.score}%`;
      case 'streak_milestone':
        return `reached a ${activity.data.streak} day streak!`;
      case 'quiz_created':
        return `created a new quiz "${activity.data.quizTitle}"`;
      case 'level_up':
        return `leveled up to level ${activity.data.level}!`;
      default:
        return 'performed an activity';
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`social-activity-card ${className}`}>
      <div className="activity-header">
        <div
          className="activity-icon"
          style={{ color: getActivityColor(activity.type) }}
        >
          {getActivityIcon(activity.type)}
        </div>
        <div className="activity-content">
          <div className="activity-user">
            <span className="username">{activity.username}</span>
            <span className="activity-text">
              {getActivityMessage(activity)}
            </span>
          </div>
          <div className="activity-time">
            {formatTimeAgo(activity.createdAt)}
          </div>
        </div>
      </div>

      {activity.data.details && (
        <div className="activity-details">{activity.data.details}</div>
      )}

      <style>{`
        .social-activity-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1rem;
          transition: all var(--transition-normal);
        }

        .social-activity-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .activity-header {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .activity-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .activity-content {
          flex: 1;
          min-width: 0;
        }

        .activity-user {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .username {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .activity-text {
          color: var(--color-text-secondary);
        }

        .activity-time {
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
        }

        .activity-details {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: var(--color-background-secondary);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  className?: string;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  entry,
  className = '',
}) => {
  const getRankIcon = (rank: number): string => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'var(--color-warning)';
      case 2:
        return 'var(--color-text-secondary)';
      case 3:
        return 'var(--color-error)';
      default:
        return 'var(--color-text-tertiary)';
    }
  };

  return (
    <div
      className={`leaderboard-card ${className} ${
        entry.rank <= 3 ? 'top-three' : ''
      }`}
    >
      <div className="rank-section">
        <div className="rank-icon" style={{ color: getRankColor(entry.rank) }}>
          {getRankIcon(entry.rank)}
        </div>
      </div>

      <div className="user-section">
        <div className="user-info">
          <div className="username">{entry.displayName}</div>
          <div className="user-stats">
            {entry.category && (
              <span className="stat-tag">{entry.category}</span>
            )}
            {entry.difficulty && (
              <span className="stat-tag">{entry.difficulty}</span>
            )}
          </div>
        </div>
      </div>

      <div className="score-section">
        <div className="score-value">{entry.score}</div>
        <div className="score-label">points</div>
      </div>

      <style>{`
        .leaderboard-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          transition: all var(--transition-normal);
        }

        .leaderboard-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .leaderboard-card.top-three {
          background: linear-gradient(135deg, var(--color-surface), var(--color-background-secondary));
          border-color: var(--color-primary);
        }

        .rank-section {
          flex-shrink: 0;
        }

        .rank-icon {
          font-size: 1.5rem;
          font-weight: 700;
          text-align: center;
          min-width: 2rem;
        }

        .user-section {
          flex: 1;
          min-width: 0;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .username {
          font-weight: 600;
          color: var(--color-text-primary);
          font-size: 1rem;
        }

        .user-stats {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .stat-tag {
          background: var(--color-background-secondary);
          color: var(--color-text-secondary);
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .score-section {
          flex-shrink: 0;
          text-align: right;
        }

        .score-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .score-label {
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
        }

        @media (max-width: 640px) {
          .leaderboard-card {
            padding: 0.75rem;
            gap: 0.75rem;
          }

          .rank-icon {
            font-size: 1.25rem;
            min-width: 1.5rem;
          }

          .score-value {
            font-size: 1.125rem;
          }
        }
      `}</style>
    </div>
  );
};

interface FriendCardProps {
  friend: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    isOnline?: boolean;
    lastActive?: Date;
  };
  onRemove?: (friendId: string) => void;
  className?: string;
}

export const FriendCard: React.FC<FriendCardProps> = ({
  friend,
  onRemove,
  className = '',
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatLastActive = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`friend-card ${className}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="friend-avatar">
        <div className="avatar-circle">
          {friend.avatar ? (
            <img src={friend.avatar} alt={friend.displayName} />
          ) : (
            <span className="avatar-initial">
              {friend.displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {friend.isOnline && <div className="online-indicator" />}
      </div>

      <div className="friend-info">
        <div className="friend-name">{friend.displayName}</div>
        <div className="friend-username">@{friend.username}</div>
        {friend.lastActive && (
          <div className="last-active">
            {friend.isOnline
              ? 'Online'
              : `Last seen ${formatLastActive(friend.lastActive)}`}
          </div>
        )}
      </div>

      {showActions && onRemove && (
        <div className="friend-actions">
          <button
            className="remove-btn"
            onClick={() => onRemove(friend.id)}
            title="Remove friend"
          >
            <FaUserMinus />
          </button>
        </div>
      )}

      <style>{`
        .friend-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          transition: all var(--transition-normal);
          position: relative;
        }

        .friend-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .friend-avatar {
          position: relative;
          flex-shrink: 0;
        }

        .avatar-circle {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          background: var(--color-primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .avatar-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-initial {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-primary);
        }

        .online-indicator {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 0.75rem;
          height: 0.75rem;
          background: var(--color-success);
          border: 2px solid var(--color-surface);
          border-radius: 50%;
        }

        .friend-info {
          flex: 1;
          min-width: 0;
        }

        .friend-name {
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 0.125rem;
        }

        .friend-username {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin-bottom: 0.25rem;
        }

        .last-active {
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
        }

        .friend-actions {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          opacity: 0;
          transition: opacity var(--transition-fast);
        }

        .friend-card:hover .friend-actions {
          opacity: 1;
        }

        .remove-btn {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: var(--color-error-light);
          color: var(--color-error);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .remove-btn:hover {
          background: var(--color-error);
          color: var(--color-text-inverse);
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default SocialActivityCard;
