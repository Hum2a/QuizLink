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
}

export type FriendStatus = 'pending' | 'accepted' | 'blocked';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'declined';
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
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
  avatar?: string;
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
  userId: string;
  totalQuizzesPlayed: number;
  totalScore: number;
  averageScore: number;
  bestStreak: number;
  currentStreak: number;
  achievementsUnlocked: number;
  friendsCount: number;
  rank: number;
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

// Local storage implementation
export class LocalSocialService implements SocialService {
  private friends: Map<string, Friend[]> = new Map();
  private friendRequests: Map<string, FriendRequest[]> = new Map();
  private leaderboards: Map<string, LeaderboardEntry[]> = new Map();
  private socialActivities: Map<string, SocialActivity[]> = new Map();
  private notifications: Map<string, SocialNotification[]> = new Map();
  private quizChallenges: Map<string, QuizChallenge[]> = new Map();
  private socialStats: Map<string, SocialStats> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('quizlink-social-data');
      if (data) {
        const parsed = JSON.parse(data);
        this.friends = new Map(parsed.friends || []);
        this.friendRequests = new Map(parsed.friendRequests || []);
        this.leaderboards = new Map(parsed.leaderboards || []);
        this.socialActivities = new Map(parsed.socialActivities || []);
        this.notifications = new Map(parsed.notifications || []);
        this.quizChallenges = new Map(parsed.quizChallenges || []);
        this.socialStats = new Map(parsed.socialStats || []);
      }
    } catch (error) {
      console.error('Failed to load social data:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        friends: Array.from(this.friends.entries()),
        friendRequests: Array.from(this.friendRequests.entries()),
        leaderboards: Array.from(this.leaderboards.entries()),
        socialActivities: Array.from(this.socialActivities.entries()),
        notifications: Array.from(this.notifications.entries()),
        quizChallenges: Array.from(this.quizChallenges.entries()),
        socialStats: Array.from(this.socialStats.entries()),
      };
      localStorage.setItem('quizlink-social-data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save social data:', error);
    }
  }

  async getFriends(userId: string): Promise<Friend[]> {
    return this.friends.get(userId) || [];
  }

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    return this.friendRequests.get(userId) || [];
  }

  async sendFriendRequest(
    fromUserId: string,
    toUserId: string,
    message?: string
  ): Promise<void> {
    const request: FriendRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUserId,
      toUserId,
      message,
      createdAt: new Date(),
      status: 'pending',
    };

    const userRequests = this.friendRequests.get(toUserId) || [];
    userRequests.push(request);
    this.friendRequests.set(toUserId, userRequests);

    // Add notification
    await this.addNotification(toUserId, {
      type: 'friend_request',
      title: 'New Friend Request',
      message: `You have a new friend request`,
      data: { requestId: request.id },
    });

    this.saveToStorage();
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    // Find and update the request
    for (const [userId, requests] of this.friendRequests.entries()) {
      const request = requests.find(r => r.id === requestId);
      if (request) {
        request.status = 'accepted';

        // Create friend relationship
        const friend1: Friend = {
          id: `friend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: request.fromUserId,
          friendId: request.toUserId,
          status: 'accepted',
          createdAt: new Date(),
          acceptedAt: new Date(),
        };

        const friend2: Friend = {
          id: `friend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: request.toUserId,
          friendId: request.fromUserId,
          status: 'accepted',
          createdAt: new Date(),
          acceptedAt: new Date(),
        };

        const fromUserFriends = this.friends.get(request.fromUserId) || [];
        const toUserFriends = this.friends.get(request.toUserId) || [];

        fromUserFriends.push(friend1);
        toUserFriends.push(friend2);

        this.friends.set(request.fromUserId, fromUserFriends);
        this.friends.set(request.toUserId, toUserFriends);

        // Add notification to requester
        await this.addNotification(request.fromUserId, {
          type: 'friend_accepted',
          title: 'Friend Request Accepted',
          message: `Your friend request was accepted`,
        });

        this.saveToStorage();
        break;
      }
    }
  }

  async declineFriendRequest(requestId: string): Promise<void> {
    for (const [userId, requests] of this.friendRequests.entries()) {
      const request = requests.find(r => r.id === requestId);
      if (request) {
        request.status = 'declined';
        this.saveToStorage();
        break;
      }
    }
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    const userFriends = this.friends.get(userId) || [];
    const friendFriends = this.friends.get(friendId) || [];

    this.friends.set(
      userId,
      userFriends.filter(f => f.friendId !== friendId)
    );
    this.friends.set(
      friendId,
      friendFriends.filter(f => f.friendId !== userId)
    );

    this.saveToStorage();
  }

  async blockUser(userId: string, blockedUserId: string): Promise<void> {
    // Remove from friends if exists
    await this.removeFriend(userId, blockedUserId);

    // Add to blocked list (simplified - just remove from friends)
    this.saveToStorage();
  }

  async getLeaderboard(
    timeFrame: 'daily' | 'weekly' | 'monthly' | 'all-time',
    category?: string,
    difficulty?: string
  ): Promise<LeaderboardEntry[]> {
    const key = `${timeFrame}_${category || 'all'}_${difficulty || 'all'}`;
    return this.leaderboards.get(key) || [];
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
    const activities = this.socialActivities.get(userId) || [];
    return activities.slice(0, limit);
  }

  async addSocialActivity(
    activity: Omit<SocialActivity, 'id' | 'createdAt'>
  ): Promise<void> {
    const newActivity: SocialActivity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    const userActivities = this.socialActivities.get(activity.userId) || [];
    userActivities.unshift(newActivity);

    // Keep only last 100 activities
    if (userActivities.length > 100) {
      userActivities.splice(100);
    }

    this.socialActivities.set(activity.userId, userActivities);
    this.saveToStorage();
  }

  async getNotifications(userId: string): Promise<SocialNotification[]> {
    return this.notifications.get(userId) || [];
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    for (const [userId, notifications] of this.notifications.entries()) {
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        this.saveToStorage();
        break;
      }
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const notifications = this.notifications.get(userId) || [];
    notifications.forEach(n => (n.read = true));
    this.notifications.set(userId, notifications);
    this.saveToStorage();
  }

  async createQuizChallenge(
    challenge: Omit<QuizChallenge, 'id' | 'createdAt'>
  ): Promise<void> {
    const newChallenge: QuizChallenge = {
      ...challenge,
      id: `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    const userChallenges = this.quizChallenges.get(challenge.toUserId) || [];
    userChallenges.push(newChallenge);
    this.quizChallenges.set(challenge.toUserId, userChallenges);

    // Add notification
    await this.addNotification(challenge.toUserId, {
      type: 'quiz_challenge',
      title: 'Quiz Challenge',
      message: `You've been challenged to a quiz!`,
      data: { challengeId: newChallenge.id },
    });

    this.saveToStorage();
  }

  async getQuizChallenges(userId: string): Promise<QuizChallenge[]> {
    return this.quizChallenges.get(userId) || [];
  }

  async acceptQuizChallenge(challengeId: string): Promise<void> {
    for (const [userId, challenges] of this.quizChallenges.entries()) {
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge) {
        challenge.status = 'accepted';
        this.saveToStorage();
        break;
      }
    }
  }

  async declineQuizChallenge(challengeId: string): Promise<void> {
    for (const [userId, challenges] of this.quizChallenges.entries()) {
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge) {
        challenge.status = 'declined';
        this.saveToStorage();
        break;
      }
    }
  }

  async completeQuizChallenge(
    challengeId: string,
    scores: { fromUser: number; toUser: number }
  ): Promise<void> {
    for (const [userId, challenges] of this.quizChallenges.entries()) {
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge) {
        challenge.status = 'completed';
        challenge.completedAt = new Date();
        challenge.scores = scores;
        challenge.winnerId =
          scores.fromUser > scores.toUser
            ? challenge.fromUserId
            : challenge.toUserId;
        this.saveToStorage();
        break;
      }
    }
  }

  async getSocialStats(userId: string): Promise<SocialStats> {
    return (
      this.socialStats.get(userId) || {
        userId,
        totalQuizzesPlayed: 0,
        totalScore: 0,
        averageScore: 0,
        bestStreak: 0,
        currentStreak: 0,
        achievementsUnlocked: 0,
        friendsCount: 0,
        rank: 0,
        level: 1,
        experience: 0,
        lastUpdated: new Date(),
      }
    );
  }

  async updateSocialStats(
    userId: string,
    stats: Partial<SocialStats>
  ): Promise<void> {
    const currentStats = await this.getSocialStats(userId);
    const updatedStats = {
      ...currentStats,
      ...stats,
      lastUpdated: new Date(),
    };
    this.socialStats.set(userId, updatedStats);
    this.saveToStorage();
  }

  private async addNotification(
    userId: string,
    notification: Omit<SocialNotification, 'id' | 'createdAt' | 'read'>
  ): Promise<void> {
    const newNotification: SocialNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      read: false,
    };

    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.unshift(newNotification);

    // Keep only last 50 notifications
    if (userNotifications.length > 50) {
      userNotifications.splice(50);
    }

    this.notifications.set(userId, userNotifications);
  }
}

// Helper functions
export const createSocialService = (): SocialService => {
  return new LocalSocialService();
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
