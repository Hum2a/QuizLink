import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  createSocialService,
  getActivityIcon,
  getActivityColor,
  getNotificationIcon,
  type SocialService,
  type Friend,
  type FriendRequest,
  type LeaderboardEntry,
  type SocialActivity,
  type SocialNotification,
  type QuizChallenge,
  type SocialStats,
} from '../services/socialService';
import { userAuthService } from './userAuth';

interface SocialContextType {
  // Friends
  friends: Friend[];
  friendRequests: FriendRequest[];
  loading: boolean;
  error: string | null;

  // Leaderboards
  leaderboard: LeaderboardEntry[];
  userRank: number;

  // Social feed
  socialFeed: SocialActivity[];

  // Notifications
  notifications: SocialNotification[];
  unreadNotifications: number;

  // Challenges
  quizChallenges: QuizChallenge[];

  // User stats
  socialStats: SocialStats | null;

  // Actions
  refreshFriends: () => Promise<void>;
  sendFriendRequest: (toUserId: string, message?: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;

  refreshLeaderboard: (
    timeFrame?: 'daily' | 'weekly' | 'monthly' | 'all-time'
  ) => Promise<void>;

  refreshSocialFeed: () => Promise<void>;
  addSocialActivity: (
    activity: Omit<SocialActivity, 'id' | 'createdAt'>
  ) => Promise<void>;

  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;

  createQuizChallenge: (
    toUserId: string,
    quizId: string,
    quizTitle: string,
    message?: string
  ) => Promise<void>;
  refreshQuizChallenges: () => Promise<void>;
  acceptQuizChallenge: (challengeId: string) => Promise<void>;
  declineQuizChallenge: (challengeId: string) => Promise<void>;

  refreshSocialStats: () => Promise<void>;
  updateSocialStats: (stats: Partial<SocialStats>) => Promise<void>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

interface SocialProviderProps {
  children: ReactNode;
}

export const SocialProvider: React.FC<SocialProviderProps> = ({ children }) => {
  const [socialService] = useState<SocialService>(createSocialService());
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [socialFeed, setSocialFeed] = useState<SocialActivity[]>([]);
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [quizChallenges, setQuizChallenges] = useState<QuizChallenge[]>([]);
  const [socialStats, setSocialStats] = useState<SocialStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = userAuthService.getCurrentUser()?.id;

  // Calculate unread notifications
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Load initial data
  useEffect(() => {
    if (currentUserId) {
      loadInitialData();
    }
  }, [currentUserId]);

  const loadInitialData = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        refreshFriends(),
        refreshLeaderboard(),
        refreshSocialFeed(),
        refreshNotifications(),
        refreshQuizChallenges(),
        refreshSocialStats(),
      ]);
    } catch (err) {
      console.error('Failed to load social data:', err);
      setError('Failed to load social data');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Friends
  const refreshFriends = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const [friendsData, requestsData] = await Promise.all([
        socialService.getFriends(currentUserId),
        socialService.getFriendRequests(currentUserId),
      ]);
      setFriends(friendsData);
      setFriendRequests(requestsData);
    } catch (err) {
      console.error('Failed to refresh friends:', err);
    }
  }, [currentUserId, socialService]);

  const sendFriendRequest = useCallback(
    async (toUserId: string, message?: string) => {
      if (!currentUserId) return;

      try {
        await socialService.sendFriendRequest(currentUserId, toUserId, message);
        await refreshFriends();
      } catch (err) {
        console.error('Failed to send friend request:', err);
        setError('Failed to send friend request');
      }
    },
    [currentUserId, socialService, refreshFriends]
  );

  const acceptFriendRequest = useCallback(
    async (requestId: string) => {
      try {
        await socialService.acceptFriendRequest(requestId);
        await refreshFriends();
      } catch (err) {
        console.error('Failed to accept friend request:', err);
        setError('Failed to accept friend request');
      }
    },
    [socialService, refreshFriends]
  );

  const declineFriendRequest = useCallback(
    async (requestId: string) => {
      try {
        await socialService.declineFriendRequest(requestId);
        await refreshFriends();
      } catch (err) {
        console.error('Failed to decline friend request:', err);
        setError('Failed to decline friend request');
      }
    },
    [socialService, refreshFriends]
  );

  const removeFriend = useCallback(
    async (friendId: string) => {
      if (!currentUserId) return;

      try {
        await socialService.removeFriend(currentUserId, friendId);
        await refreshFriends();
      } catch (err) {
        console.error('Failed to remove friend:', err);
        setError('Failed to remove friend');
      }
    },
    [currentUserId, socialService, refreshFriends]
  );

  // Leaderboards
  const refreshLeaderboard = useCallback(
    async (
      timeFrame: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'all-time'
    ) => {
      if (!currentUserId) return;

      try {
        const [leaderboardData, rank] = await Promise.all([
          socialService.getLeaderboard(timeFrame),
          socialService.getUserRank(currentUserId, timeFrame),
        ]);
        setLeaderboard(leaderboardData);
        setUserRank(rank);
      } catch (err) {
        console.error('Failed to refresh leaderboard:', err);
      }
    },
    [currentUserId, socialService]
  );

  // Social feed
  const refreshSocialFeed = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const feedData = await socialService.getSocialFeed(currentUserId, 20);
      setSocialFeed(feedData);
    } catch (err) {
      console.error('Failed to refresh social feed:', err);
    }
  }, [currentUserId, socialService]);

  const addSocialActivity = useCallback(
    async (activity: Omit<SocialActivity, 'id' | 'createdAt'>) => {
      try {
        await socialService.addSocialActivity(activity);
        await refreshSocialFeed();
      } catch (err) {
        console.error('Failed to add social activity:', err);
      }
    },
    [socialService, refreshSocialFeed]
  );

  // Notifications
  const refreshNotifications = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const notificationsData = await socialService.getNotifications(
        currentUserId
      );
      setNotifications(notificationsData);
    } catch (err) {
      console.error('Failed to refresh notifications:', err);
    }
  }, [currentUserId, socialService]);

  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await socialService.markNotificationAsRead(notificationId);
        await refreshNotifications();
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    },
    [socialService, refreshNotifications]
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    if (!currentUserId) return;

    try {
      await socialService.markAllNotificationsAsRead(currentUserId);
      await refreshNotifications();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [currentUserId, socialService, refreshNotifications]);

  // Quiz challenges
  const createQuizChallenge = useCallback(
    async (
      toUserId: string,
      quizId: string,
      quizTitle: string,
      message?: string
    ) => {
      if (!currentUserId) return;

      try {
        await socialService.createQuizChallenge({
          fromUserId: currentUserId,
          toUserId,
          quizId,
          quizTitle,
          message,
          status: 'pending',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });
        await refreshQuizChallenges();
      } catch (err) {
        console.error('Failed to create quiz challenge:', err);
        setError('Failed to create quiz challenge');
      }
    },
    [currentUserId, socialService]
  );

  const refreshQuizChallenges = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const challengesData = await socialService.getQuizChallenges(
        currentUserId
      );
      setQuizChallenges(challengesData);
    } catch (err) {
      console.error('Failed to refresh quiz challenges:', err);
    }
  }, [currentUserId, socialService]);

  const acceptQuizChallenge = useCallback(
    async (challengeId: string) => {
      try {
        await socialService.acceptQuizChallenge(challengeId);
        await refreshQuizChallenges();
      } catch (err) {
        console.error('Failed to accept quiz challenge:', err);
        setError('Failed to accept quiz challenge');
      }
    },
    [socialService, refreshQuizChallenges]
  );

  const declineQuizChallenge = useCallback(
    async (challengeId: string) => {
      try {
        await socialService.declineQuizChallenge(challengeId);
        await refreshQuizChallenges();
      } catch (err) {
        console.error('Failed to decline quiz challenge:', err);
        setError('Failed to decline quiz challenge');
      }
    },
    [socialService, refreshQuizChallenges]
  );

  // Social stats
  const refreshSocialStats = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const statsData = await socialService.getSocialStats(currentUserId);
      setSocialStats(statsData);
    } catch (err) {
      console.error('Failed to refresh social stats:', err);
    }
  }, [currentUserId, socialService]);

  const updateSocialStats = useCallback(
    async (stats: Partial<SocialStats>) => {
      if (!currentUserId) return;

      try {
        await socialService.updateSocialStats(currentUserId, stats);
        await refreshSocialStats();
      } catch (err) {
        console.error('Failed to update social stats:', err);
        setError('Failed to update social stats');
      }
    },
    [currentUserId, socialService, refreshSocialStats]
  );

  const value: SocialContextType = {
    // State
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

    // Actions
    refreshFriends,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,

    refreshLeaderboard,

    refreshSocialFeed,
    addSocialActivity,

    refreshNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,

    createQuizChallenge,
    refreshQuizChallenges,
    acceptQuizChallenge,
    declineQuizChallenge,

    refreshSocialStats,
    updateSocialStats,
  };

  return (
    <SocialContext.Provider value={value}>{children}</SocialContext.Provider>
  );
};

export const useSocial = (): SocialContextType => {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

export default SocialContext;
