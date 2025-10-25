import { useCallback } from 'react';
import { useSocial } from '../contexts/SocialContext';
import type { SocialActivityType } from '../services/databaseSocialService';

export const useSocialTracking = () => {
  const { addSocialActivity, updateSocialStats } = useSocial();

  const trackQuizCompletion = useCallback(
    (quizData: {
      quizId: string;
      quizTitle: string;
      score: number;
      totalQuestions: number;
      timeSpent: number;
      isHighScore?: boolean;
    }) => {
      // Add social activity
      addSocialActivity({
        userId: 'current-user', // Will be replaced with actual user ID
        username: 'current-user',
        displayName: 'Current User',
        type: 'quiz_completed',
        data: {
          quizTitle: quizData.quizTitle,
          score: quizData.score,
          totalQuestions: quizData.totalQuestions,
          timeSpent: quizData.timeSpent,
          percentage: Math.round(
            (quizData.score / quizData.totalQuestions) * 100
          ),
        },
        isPublic: true,
      });

      // Track high score
      if (quizData.isHighScore) {
        addSocialActivity({
          userId: 'current-user',
          username: 'current-user',
          displayName: 'Current User',
          type: 'high_score',
          data: {
            quizTitle: quizData.quizTitle,
            score: quizData.score,
            percentage: Math.round(
              (quizData.score / quizData.totalQuestions) * 100
            ),
          },
          isPublic: true,
        });
      }

      // Update social stats
      updateSocialStats({
        totalQuizzesPlayed: 1, // This should be incremented, not set to 1
        totalScore: quizData.score,
        averageScore: Math.round(
          (quizData.score / quizData.totalQuestions) * 100
        ),
      });
    },
    [addSocialActivity, updateSocialStats]
  );

  const trackAchievementUnlock = useCallback(
    (achievementData: {
      achievementId: string;
      achievementTitle: string;
      achievementDescription: string;
      points: number;
    }) => {
      addSocialActivity({
        userId: 'current-user',
        username: 'current-user',
        displayName: 'Current User',
        type: 'achievement_unlocked',
        data: {
          achievementTitle: achievementData.achievementTitle,
          achievementDescription: achievementData.achievementDescription,
          points: achievementData.points,
        },
        isPublic: true,
      });

      updateSocialStats({
        achievementsUnlocked: 1, // This should be incremented
      });
    },
    [addSocialActivity, updateSocialStats]
  );

  const trackStreakMilestone = useCallback(
    (streakData: { streak: number; milestone: number }) => {
      addSocialActivity({
        userId: 'current-user',
        username: 'current-user',
        displayName: 'Current User',
        type: 'streak_milestone',
        data: {
          streak: streakData.streak,
          milestone: streakData.milestone,
        },
        isPublic: true,
      });

      updateSocialStats({
        currentStreak: streakData.streak,
        bestStreak: Math.max(streakData.streak, 0), // This should be compared with current best
      });
    },
    [addSocialActivity, updateSocialStats]
  );

  const trackQuizCreation = useCallback(
    (quizData: {
      quizId: string;
      quizTitle: string;
      category: string;
      difficulty: string;
      questionCount: number;
    }) => {
      addSocialActivity({
        userId: 'current-user',
        username: 'current-user',
        displayName: 'Current User',
        type: 'quiz_created',
        data: {
          quizTitle: quizData.quizTitle,
          category: quizData.category,
          difficulty: quizData.difficulty,
          questionCount: quizData.questionCount,
        },
        isPublic: true,
      });
    },
    [addSocialActivity]
  );

  const trackLevelUp = useCallback(
    (levelData: {
      newLevel: number;
      experience: number;
      previousLevel: number;
    }) => {
      addSocialActivity({
        userId: 'current-user',
        username: 'current-user',
        displayName: 'Current User',
        type: 'level_up',
        data: {
          level: levelData.newLevel,
          experience: levelData.experience,
          previousLevel: levelData.previousLevel,
        },
        isPublic: true,
      });

      updateSocialStats({
        level: levelData.newLevel,
        experience: levelData.experience,
      });
    },
    [addSocialActivity, updateSocialStats]
  );

  const trackFriendAdded = useCallback(
    (friendData: {
      friendId: string;
      friendName: string;
      friendUsername: string;
    }) => {
      addSocialActivity({
        userId: 'current-user',
        username: 'current-user',
        displayName: 'Current User',
        type: 'friend_added',
        data: {
          friendName: friendData.friendName,
          friendUsername: friendData.friendUsername,
        },
        isPublic: true,
      });

      updateSocialStats({
        friendsCount: 1, // This should be incremented
      });
    },
    [addSocialActivity, updateSocialStats]
  );

  return {
    trackQuizCompletion,
    trackAchievementUnlock,
    trackStreakMilestone,
    trackQuizCreation,
    trackLevelUp,
    trackFriendAdded,
  };
};

export default useSocialTracking;
