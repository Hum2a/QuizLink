import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaTrophy,
  FaBell,
  FaFire,
  FaChartLine,
  FaUserPlus,
  FaSearch,
  FaFilter,
  FaRefresh,
} from 'react-icons/fa';
import { useSocial } from '../contexts/SocialContext';
import {
  SocialActivityCard,
  LeaderboardCard,
  FriendCard,
} from '../components/SocialComponents';
import LoadingSpinner from '../components/LoadingSpinner';
import type { FriendRequest, QuizChallenge } from '../services/socialService';

const SocialDashboard: React.FC = () => {
  const {
    friends,
    friendRequests,
    leaderboard,
    userRank,
    socialFeed,
    notifications,
    unreadNotifications,
    quizChallenges,
    socialStats,
    loading,
    error,
    refreshFriends,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    refreshLeaderboard,
    refreshSocialFeed,
    refreshNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    acceptQuizChallenge,
    declineQuizChallenge,
  } = useSocial();

  const [activeTab, setActiveTab] = useState<
    'feed' | 'friends' | 'leaderboard' | 'notifications' | 'challenges'
  >('feed');
  const [leaderboardTimeFrame, setLeaderboardTimeFrame] = useState<
    'daily' | 'weekly' | 'monthly' | 'all-time'
  >('all-time');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    refreshLeaderboard(leaderboardTimeFrame);
  }, [leaderboardTimeFrame]);

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'feed':
        return <FaFire />;
      case 'friends':
        return <FaUsers />;
      case 'leaderboard':
        return <FaTrophy />;
      case 'notifications':
        return <FaBell />;
      case 'challenges':
        return <FaChartLine />;
      default:
        return <FaFire />;
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'feed':
        return 'Social Feed';
      case 'friends':
        return 'Friends';
      case 'leaderboard':
        return 'Leaderboard';
      case 'notifications':
        return 'Notifications';
      case 'challenges':
        return 'Challenges';
      default:
        return 'Social Feed';
    }
  };

  const filteredFriends = friends.filter(
    friend =>
      friend.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingFriendRequests = friendRequests.filter(
    req => req.status === 'pending'
  );
  const pendingChallenges = quizChallenges.filter(
    challenge => challenge.status === 'pending'
  );

  if (loading && friends.length === 0) {
    return (
      <div className="social-dashboard">
        <LoadingSpinner message="Loading social features..." size="large" />
      </div>
    );
  }

  return (
    <div className="social-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>
            <FaUsers /> Social Hub
          </h1>
          <p>Connect with friends and compete on leaderboards</p>
        </div>

        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{friends.length}</span>
            <span className="stat-label">Friends</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{userRank || 'N/A'}</span>
            <span className="stat-label">Rank</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{unreadNotifications}</span>
            <span className="stat-label">Notifications</span>
          </div>
        </div>
      </div>

      {/* User Stats Summary */}
      {socialStats && (
        <div className="stats-summary">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">{socialStats.totalQuizzesPlayed}</div>
              <div className="stat-label">Quizzes Played</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-value">
                {Math.round(socialStats.averageScore)}%
              </div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-value">{socialStats.currentStreak}</div>
              <div className="stat-label">Current Streak</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-value">
                {socialStats.achievementsUnlocked}
              </div>
              <div className="stat-label">Achievements</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        {(
          [
            'feed',
            'friends',
            'leaderboard',
            'notifications',
            'challenges',
          ] as const
        ).map(tab => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {getTabIcon(tab)}
            {getTabLabel(tab)}
            {tab === 'notifications' && unreadNotifications > 0 && (
              <span className="notification-badge">{unreadNotifications}</span>
            )}
            {tab === 'challenges' && pendingChallenges.length > 0 && (
              <span className="challenge-badge">
                {pendingChallenges.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Social Feed */}
        {activeTab === 'feed' && (
          <div className="feed-section">
            <div className="section-header">
              <h2>Recent Activity</h2>
              <button className="refresh-btn" onClick={refreshSocialFeed}>
                <FaRefresh />
              </button>
            </div>

            {socialFeed.length > 0 ? (
              <div className="feed-grid">
                {socialFeed.map(activity => (
                  <SocialActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FaFire size={64} color="var(--color-text-tertiary)" />
                <h3>No activity yet</h3>
                <p>Start playing quizzes to see activity in your feed!</p>
              </div>
            )}
          </div>
        )}

        {/* Friends */}
        {activeTab === 'friends' && (
          <div className="friends-section">
            <div className="section-header">
              <h2>Friends</h2>
              <div className="header-actions">
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search friends..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                <button className="add-friend-btn">
                  <FaUserPlus /> Add Friend
                </button>
              </div>
            </div>

            {/* Pending Friend Requests */}
            {pendingFriendRequests.length > 0 && (
              <div className="pending-requests">
                <h3>Pending Requests</h3>
                <div className="requests-grid">
                  {pendingFriendRequests.map(request => (
                    <div key={request.id} className="request-card">
                      <div className="request-info">
                        <div className="request-user">{request.fromUserId}</div>
                        {request.message && (
                          <div className="request-message">
                            {request.message}
                          </div>
                        )}
                      </div>
                      <div className="request-actions">
                        <button
                          className="accept-btn"
                          onClick={() => acceptFriendRequest(request.id)}
                        >
                          <FaUserPlus />
                        </button>
                        <button
                          className="decline-btn"
                          onClick={() => declineFriendRequest(request.id)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends List */}
            <div className="friends-list">
              {filteredFriends.length > 0 ? (
                <div className="friends-grid">
                  {filteredFriends.map(friend => (
                    <FriendCard
                      key={friend.id}
                      friend={{
                        id: friend.friendId,
                        username: friend.friendId, // Simplified for demo
                        displayName: friend.friendId,
                        isOnline: Math.random() > 0.5, // Random for demo
                        lastActive: new Date(),
                      }}
                      onRemove={friendId => removeFriend(friendId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaUsers size={64} color="var(--color-text-tertiary)" />
                  <h3>No friends yet</h3>
                  <p>Add friends to see their activity and compete together!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="leaderboard-section">
            <div className="section-header">
              <h2>Leaderboard</h2>
              <div className="timeframe-selector">
                <select
                  value={leaderboardTimeFrame}
                  onChange={e => setLeaderboardTimeFrame(e.target.value as any)}
                  className="timeframe-select"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="all-time">All Time</option>
                </select>
              </div>
            </div>

            {leaderboard.length > 0 ? (
              <div className="leaderboard-list">
                {leaderboard.map(entry => (
                  <LeaderboardCard key={entry.userId} entry={entry} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FaTrophy size={64} color="var(--color-text-tertiary)" />
                <h3>No leaderboard data</h3>
                <p>Play some quizzes to see rankings!</p>
              </div>
            )}
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="notifications-section">
            <div className="section-header">
              <h2>Notifications</h2>
              {unreadNotifications > 0 && (
                <button
                  className="mark-all-read-btn"
                  onClick={markAllNotificationsAsRead}
                >
                  Mark All Read
                </button>
              )}
            </div>

            {notifications.length > 0 ? (
              <div className="notifications-list">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`notification-item ${
                      notification.read ? 'read' : 'unread'
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      {notification.type === 'friend_request' && '👤'}
                      {notification.type === 'friend_accepted' && '✅'}
                      {notification.type === 'achievement_unlocked' && '🏆'}
                      {notification.type === 'high_score_beaten' && '📈'}
                      {notification.type === 'quiz_challenge' && '⚔️'}
                      {notification.type === 'streak_milestone' && '🔥'}
                      {notification.type === 'level_up' && '⬆️'}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">
                        {notification.title}
                      </div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-time">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {!notification.read && <div className="unread-indicator" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FaBell size={64} color="var(--color-text-tertiary)" />
                <h3>No notifications</h3>
                <p>You're all caught up!</p>
              </div>
            )}
          </div>
        )}

        {/* Challenges */}
        {activeTab === 'challenges' && (
          <div className="challenges-section">
            <div className="section-header">
              <h2>Quiz Challenges</h2>
              <button className="create-challenge-btn">
                <FaChartLine /> Create Challenge
              </button>
            </div>

            {pendingChallenges.length > 0 ? (
              <div className="challenges-list">
                {pendingChallenges.map(challenge => (
                  <div key={challenge.id} className="challenge-card">
                    <div className="challenge-info">
                      <div className="challenge-title">
                        {challenge.quizTitle}
                      </div>
                      <div className="challenge-from">
                        From: {challenge.fromUserId}
                      </div>
                      {challenge.message && (
                        <div className="challenge-message">
                          {challenge.message}
                        </div>
                      )}
                    </div>
                    <div className="challenge-actions">
                      <button
                        className="accept-challenge-btn"
                        onClick={() => acceptQuizChallenge(challenge.id)}
                      >
                        Accept
                      </button>
                      <button
                        className="decline-challenge-btn"
                        onClick={() => declineQuizChallenge(challenge.id)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FaChartLine size={64} color="var(--color-text-tertiary)" />
                <h3>No pending challenges</h3>
                <p>Challenge friends to quiz battles!</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .social-dashboard {
          min-height: 100vh;
          background: var(--color-background);
          padding: 2rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-content h1 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0 0 0.5rem 0;
          color: var(--color-text-primary);
          font-size: 2.5rem;
          font-weight: 700;
        }

        .header-content p {
          color: var(--color-text-secondary);
          font-size: 1.125rem;
          margin: 0;
        }

        .header-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-primary);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .stats-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-content {
          flex: 1;
        }

        .stat-content .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 0.25rem;
        }

        .stat-content .stat-label {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }

        .tab-navigation {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--color-surface);
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
          position: relative;
        }

        .tab-button:hover {
          background: var(--color-surface-hover);
          color: var(--color-text-primary);
        }

        .tab-button.active {
          background: var(--color-primary);
          color: var(--color-text-inverse);
          border-color: var(--color-primary);
        }

        .notification-badge,
        .challenge-badge {
          position: absolute;
          top: -0.25rem;
          right: -0.25rem;
          background: var(--color-error);
          color: var(--color-text-inverse);
          border-radius: 50%;
          width: 1.25rem;
          height: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .tab-content {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 2rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--color-border);
        }

        .section-header h2 {
          margin: 0;
          color: var(--color-text-primary);
          font-size: 1.5rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .search-box {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-tertiary);
        }

        .search-input {
          padding: 0.5rem 0.75rem 0.5rem 2rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-background);
          color: var(--color-text-primary);
          min-width: 200px;
        }

        .add-friend-btn,
        .refresh-btn,
        .mark-all-read-btn,
        .create-challenge-btn {
          padding: 0.5rem 1rem;
          background: var(--color-primary);
          color: var(--color-text-inverse);
          border: none;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .add-friend-btn:hover,
        .refresh-btn:hover,
        .mark-all-read-btn:hover,
        .create-challenge-btn:hover {
          background: var(--color-primary-hover);
          transform: translateY(-1px);
        }

        .timeframe-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .timeframe-select {
          padding: 0.5rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-background);
          color: var(--color-text-primary);
        }

        .feed-grid,
        .friends-grid,
        .leaderboard-list,
        .notifications-list,
        .challenges-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .request-card {
          background: var(--color-background-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .request-info {
          flex: 1;
        }

        .request-user {
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 0.25rem;
        }

        .request-message {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }

        .request-actions {
          display: flex;
          gap: 0.5rem;
        }

        .accept-btn,
        .decline-btn {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .accept-btn {
          background: var(--color-success-light);
          color: var(--color-success);
        }

        .accept-btn:hover {
          background: var(--color-success);
          color: var(--color-text-inverse);
        }

        .decline-btn {
          background: var(--color-error-light);
          color: var(--color-error);
        }

        .decline-btn:hover {
          background: var(--color-error);
          color: var(--color-text-inverse);
        }

        .notification-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--color-background-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
        }

        .notification-item:hover {
          background: var(--color-surface-hover);
        }

        .notification-item.unread {
          border-left: 4px solid var(--color-primary);
        }

        .notification-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
        }

        .notification-title {
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 0.25rem;
        }

        .notification-message {
          color: var(--color-text-secondary);
          margin-bottom: 0.25rem;
        }

        .notification-time {
          font-size: 0.75rem;
          color: var(--color-text-tertiary);
        }

        .unread-indicator {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 0.5rem;
          height: 0.5rem;
          background: var(--color-primary);
          border-radius: 50%;
        }

        .challenge-card {
          background: var(--color-background-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .challenge-info {
          flex: 1;
        }

        .challenge-title {
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 0.25rem;
        }

        .challenge-from {
          color: var(--color-text-secondary);
          margin-bottom: 0.5rem;
        }

        .challenge-message {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }

        .challenge-actions {
          display: flex;
          gap: 0.75rem;
        }

        .accept-challenge-btn,
        .decline-challenge-btn {
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .accept-challenge-btn {
          background: var(--color-success);
          color: var(--color-text-inverse);
        }

        .accept-challenge-btn:hover {
          background: var(--color-success-hover);
        }

        .decline-challenge-btn {
          background: var(--color-error);
          color: var(--color-text-inverse);
        }

        .decline-challenge-btn:hover {
          background: var(--color-error-hover);
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--color-text-secondary);
        }

        .empty-state h3 {
          margin: 1rem 0 0.5rem 0;
          color: var(--color-text-primary);
        }

        .empty-state p {
          margin: 0;
        }

        @media (max-width: 768px) {
          .social-dashboard {
            padding: 1rem;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .header-stats {
            justify-content: space-around;
          }

          .tab-navigation {
            flex-wrap: wrap;
          }

          .section-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .header-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input {
            min-width: auto;
          }

          .challenge-card {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .challenge-actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default SocialDashboard;
