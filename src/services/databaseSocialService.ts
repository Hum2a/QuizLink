import { config } from '../config';
import { userAuthService } from './userAuth';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  joinDate: Date;
  lastActive: Date;
  isOnline: boolean;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: FriendStatus;
  createdAt: Date;
  acceptedAt?: Date;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastActive?: Date;
}

export type FriendStatus = 'pending' | 'accepted' | 'blocked';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'declined';
  username?: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  rank: number;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeFrame: 'daily' | 'weekly' | 'monthly' | 'all-time';
  lastPlayed: Date;
}

export interface SocialActivity {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  type: SocialActivityType;
  data: any;
  createdAt: Date;
  isPublic: boolean;
}

export type SocialActivityType =
  | 'quiz_completed'
  | 'achievement_unlocked'
  | 'friend_added'
  | 'high_score'
  | 'streak_milestone'
  | 'quiz_created'
  | 'level_up';

export interface SocialNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'achievement_unlocked'
  | 'high_score_beaten'
  | 'quiz_challenge'
  | 'streak_milestone'
  | 'level_up';

export interface QuizChallenge {
  id: string;
  fromUserId: string;
  toUserId: string;
  quizId: string;
  quizTitle: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  winnerId?: string;
  scores?: {
    fromUser: number;
    toUser: number;
  };
}

export interface SocialStats {
  id: string;
  userId: string;
  totalQuizzesPlayed: number;
  totalScore: number;
  averageScore: number;
  bestStreak: number;
  currentStreak: number;
  achievementsUnlocked: number;
  friendsCount: number;
  level: number;
  experience: number;
  lastUpdated: Date;
}

export interface SocialService {
  // Friend management
  getFriends: (userId: string) => Promise<Friend[]>;
  getFriendRequests: (userId: string) => Promise<FriendRequest[]>;
  sendFriendRequest: (
    fromUserId: string,
    toUserId: string,
    message?: string
  ) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (userId: string, friendId: string) => Promise<void>;
  blockUser: (userId: string, blockedUserId: string) => Promise<void>;

  // Leaderboards
  getLeaderboard: (
    timeFrame: 'daily' | 'weekly' | 'monthly' | 'all-time',
    category?: string,
    difficulty?: string
  ) => Promise<LeaderboardEntry[]>;
  getUserRank: (
    userId: string,
    timeFrame: 'daily' | 'weekly' | 'monthly' | 'all-time'
  ) => Promise<number>;

  // Social activities
  getSocialFeed: (userId: string, limit?: number) => Promise<SocialActivity[]>;
  addSocialActivity: (
    activity: Omit<SocialActivity, 'id' | 'createdAt'>
  ) => Promise<void>;

  // Notifications
  getNotifications: (userId: string) => Promise<SocialNotification[]>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: (userId: string) => Promise<void>;

  // Challenges
  createQuizChallenge: (
    challenge: Omit<QuizChallenge, 'id' | 'createdAt'>
  ) => Promise<void>;
  getQuizChallenges: (userId: string) => Promise<QuizChallenge[]>;
  acceptQuizChallenge: (challengeId: string) => Promise<void>;
  declineQuizChallenge: (challengeId: string) => Promise<void>;
  completeQuizChallenge: (
    challengeId: string,
    scores: { fromUser: number; toUser: number }
  ) => Promise<void>;

  // User stats
  getSocialStats: (userId: string) => Promise<SocialStats>;
  updateSocialStats: (
    userId: string,
    stats: Partial<SocialStats>
  ) => Promise<void>;
}

// Database-backed implementation
export class DatabaseSocialService implements SocialService {
  private getAuthHeaders(): HeadersInit {
    const token = userAuthService.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${config.API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getFriends(userId: string): Promise<Friend[]> {
    const friends = await this.makeRequest<Friend[]>('/api/social/friends');
    return friends.map(friend => ({
      ...friend,
      createdAt: new Date(friend.createdAt),
      acceptedAt: friend.acceptedAt ? new Date(friend.acceptedAt) : undefined,
      lastActive: friend.lastActive ? new Date(friend.lastActive) : undefined,
    }));
  }

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    const requests = await this.makeRequest<FriendRequest[]>(
      '/api/social/friend-requests'
    );
    return requests.map(request => ({
      ...request,
      createdAt: new Date(request.createdAt),
    }));
  }

  async sendFriendRequest(
    fromUserId: string,
    toUserId: string,
    message?: string
  ): Promise<void> {
    await this.makeRequest('/api/social/friend-requests', {
      method: 'POST',
      body: JSON.stringify({ toUserId, message }),
    });
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    await this.makeRequest(`/api/social/friend-requests/${requestId}/accept`, {
      method: 'PUT',
    });
  }

  async declineFriendRequest(requestId: string): Promise<void> {
    await this.makeRequest(`/api/social/friend-requests/${requestId}/decline`, {
      method: 'PUT',
    });
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    await this.makeRequest(`/api/social/friends/${friendId}`, {
      method: 'DELETE',
    });
  }

  async blockUser(userId: string, blockedUserId: string): Promise<void> {
    // For now, just remove as friend - can be extended later
    await this.removeFriend(userId, blockedUserId);
  }

  async getLeaderboard(
    timeFrame: 'daily' | 'weekly' | 'monthly' | 'all-time',
    category?: string,
    difficulty?: string
  ): Promise<LeaderboardEntry[]> {
    const params = new URLSearchParams();
    params.set('timeFrame', timeFrame);
    if (category) params.set('category', category);
    if (difficulty) params.set('difficulty', difficulty);

    const leaderboard = await this.makeRequest<LeaderboardEntry[]>(
      `/api/social/leaderboard?${params}`
    );
    return leaderboard.map(entry => ({
      ...entry,
      lastPlayed: new Date(entry.lastPlayed),
    }));
  }

  async getUserRank(
    userId: string,
    timeFrame: 'daily' | 'weekly' | 'monthly' | 'all-time'
  ): Promise<number> {
    const leaderboard = await this.getLeaderboard(timeFrame);
    const entry = leaderboard.find(e => e.userId === userId);
    return entry ? entry.rank : 0;
  }

  async getSocialFeed(
    userId: string,
    limit: number = 20
  ): Promise<SocialActivity[]> {
    const feed = await this.makeRequest<SocialActivity[]>(
      `/api/social/feed?limit=${limit}`
    );
    return feed.map(activity => ({
      ...activity,
      createdAt: new Date(activity.createdAt),
    }));
  }

  async addSocialActivity(
    activity: Omit<SocialActivity, 'id' | 'createdAt'>
  ): Promise<void> {
    await this.makeRequest('/api/social/activities', {
      method: 'POST',
      body: JSON.stringify({
        activityType: activity.type,
        activityData: activity.data,
        isPublic: activity.isPublic,
      }),
    });
  }

  async getNotifications(userId: string): Promise<SocialNotification[]> {
    const notifications = await this.makeRequest<SocialNotification[]>(
      '/api/social/notifications'
    );
    return notifications.map(notification => ({
      ...notification,
      createdAt: new Date(notification.createdAt),
    }));
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.makeRequest(`/api/social/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.makeRequest('/api/social/notifications/read-all', {
      method: 'PUT',
    });
  }

  async createQuizChallenge(
    challenge: Omit<QuizChallenge, 'id' | 'createdAt'>
  ): Promise<void> {
    // This would need to be implemented in the backend
    throw new Error('Quiz challenges not yet implemented in backend');
  }

  async getQuizChallenges(userId: string): Promise<QuizChallenge[]> {
    // This would need to be implemented in the backend
    return [];
  }

  async acceptQuizChallenge(challengeId: string): Promise<void> {
    // This would need to be implemented in the backend
    throw new Error('Quiz challenges not yet implemented in backend');
  }

  async declineQuizChallenge(challengeId: string): Promise<void> {
    // This would need to be implemented in the backend
    throw new Error('Quiz challenges not yet implemented in backend');
  }

  async completeQuizChallenge(
    challengeId: string,
    scores: { fromUser: number; toUser: number }
  ): Promise<void> {
    // This would need to be implemented in the backend
    throw new Error('Quiz challenges not yet implemented in backend');
  }

  async getSocialStats(userId: string): Promise<SocialStats> {
    const stats = await this.makeRequest<SocialStats>('/api/social/stats');
    return {
      ...stats,
      lastUpdated: new Date(stats.lastUpdated),
    };
  }

  async updateSocialStats(
    userId: string,
    stats: Partial<SocialStats>
  ): Promise<void> {
    await this.makeRequest('/api/social/stats', {
      method: 'PUT',
      body: JSON.stringify(stats),
    });
  }
}

// Helper functions
export const createSocialService = (): SocialService => {
  return new DatabaseSocialService();
};

export const getActivityIcon = (type: SocialActivityType): string => {
  switch (type) {
    case 'quiz_completed':
      return '🎯';
    case 'achievement_unlocked':
      return '🏆';
    case 'friend_added':
      return '👥';
    case 'high_score':
      return '⭐';
    case 'streak_milestone':
      return '🔥';
    case 'quiz_created':
      return '📝';
    case 'level_up':
      return '⬆️';
    default:
      return '📢';
  }
};

export const getActivityColor = (type: SocialActivityType): string => {
  switch (type) {
    case 'quiz_completed':
      return 'var(--color-success)';
    case 'achievement_unlocked':
      return 'var(--color-warning)';
    case 'friend_added':
      return 'var(--color-primary)';
    case 'high_score':
      return 'var(--color-error)';
    case 'streak_milestone':
      return 'var(--color-error)';
    case 'quiz_created':
      return 'var(--color-info)';
    case 'level_up':
      return 'var(--color-secondary)';
    default:
      return 'var(--color-text-secondary)';
  }
};

export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'friend_request':
      return '👤';
    case 'friend_accepted':
      return '✅';
    case 'achievement_unlocked':
      return '🏆';
    case 'high_score_beaten':
      return '📈';
    case 'quiz_challenge':
      return '⚔️';
    case 'streak_milestone':
      return '🔥';
    case 'level_up':
      return '⬆️';
    default:
      return '🔔';
  }
};
