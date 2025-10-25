import { useCallback } from 'react';
import { useAchievements } from '../contexts/AchievementContext';
import type { AchievementRequirement } from '../types/achievements';

export const useAchievementTracking = () => {
  const { checkAchievement, unlockAchievement } = useAchievements();

  const trackQuizCompletion = useCallback(
    (quizData: {
      questionsAnswered: number;
      correctAnswers: number;
      timeSpent: number;
      category: string;
      isPerfect: boolean;
    }) => {
      // Track basic quiz completion
      checkAchievement(
        { type: 'quizzes_completed', value: 1, description: 'Complete 1 quiz' },
        1
      );

      // Track questions answered
      checkAchievement(
        {
          type: 'questions_answered',
          value: quizData.questionsAnswered,
          description: `Answer ${quizData.questionsAnswered} questions`,
        },
        quizData.questionsAnswered
      );

      // Track perfect scores
      if (quizData.isPerfect) {
        checkAchievement(
          {
            type: 'perfect_scores',
            value: 1,
            description: 'Get 100% on 1 quiz',
          },
          1
        );
      }

      // Track speed achievements
      if (quizData.timeSpent < 30) {
        checkAchievement(
          {
            type: 'time_under',
            value: 30,
            description: 'Answer questions in under 30 seconds total',
          },
          quizData.timeSpent
        );
      }

      // Track category exploration
      checkAchievement(
        {
          type: 'categories_explored',
          value: 1,
          description: 'Complete quizzes in 1 different category',
        },
        1
      );
    },
    [checkAchievement]
  );

  const trackQuizCreation = useCallback(() => {
    checkAchievement(
      { type: 'quizzes_created', value: 1, description: 'Create 1 quiz' },
      1
    );
  }, [checkAchievement]);

  const trackDailyStreak = useCallback(() => {
    checkAchievement(
      {
        type: 'streak_days',
        value: 1,
        description: 'Play quizzes for 1 day in a row',
      },
      1
    );
  }, [checkAchievement]);

  const trackSpecialTime = useCallback(
    (hour: number) => {
      if (hour < 8) {
        // Early bird achievement
        unlockAchievement('early_bird');
      } else if (hour > 23) {
        // Night owl achievement
        unlockAchievement('night_owl');
      }
    },
    [unlockAchievement]
  );

  return {
    trackQuizCompletion,
    trackQuizCreation,
    trackDailyStreak,
    trackSpecialTime,
  };
};
