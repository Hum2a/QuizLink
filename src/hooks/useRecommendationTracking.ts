import { useCallback } from 'react';
import { useRecommendations } from '../contexts/RecommendationContext';
import type { PlayHistoryEntry } from '../services/recommendationEngine';

export const useRecommendationTracking = () => {
  const { updatePreferences } = useRecommendations();

  const trackQuizCompletion = useCallback(
    (quizData: {
      quizId: string;
      quizTitle: string;
      category: string;
      difficulty: 'easy' | 'medium' | 'hard';
      topics: string[];
      score: number;
      totalQuestions: number;
      timeSpent: number;
      completed: boolean;
    }) => {
      const playHistory: PlayHistoryEntry = {
        quizId: quizData.quizId,
        quizTitle: quizData.quizTitle,
        category: quizData.category,
        difficulty: quizData.difficulty,
        topics: quizData.topics,
        score: quizData.score,
        totalQuestions: quizData.totalQuestions,
        timeSpent: quizData.timeSpent,
        playedAt: new Date(),
        completed: quizData.completed,
      };

      updatePreferences(playHistory);
    },
    [updatePreferences]
  );

  const trackQuizStart = useCallback(
    (quizData: {
      quizId: string;
      quizTitle: string;
      category: string;
      difficulty: 'easy' | 'medium' | 'hard';
      topics: string[];
    }) => {
      // Track quiz start for analytics (optional)
      console.log('Quiz started:', quizData);
    },
    []
  );

  const trackQuizAbandon = useCallback(
    (quizData: {
      quizId: string;
      quizTitle: string;
      category: string;
      difficulty: 'easy' | 'medium' | 'hard';
      topics: string[];
      timeSpent: number;
      questionsAnswered: number;
    }) => {
      const playHistory: PlayHistoryEntry = {
        quizId: quizData.quizId,
        quizTitle: quizData.quizTitle,
        category: quizData.category,
        difficulty: quizData.difficulty,
        topics: quizData.topics,
        score: 0, // No score for abandoned quizzes
        totalQuestions: quizData.questionsAnswered,
        timeSpent: quizData.timeSpent,
        playedAt: new Date(),
        completed: false,
      };

      updatePreferences(playHistory);
    },
    [updatePreferences]
  );

  return {
    trackQuizCompletion,
    trackQuizStart,
    trackQuizAbandon,
  };
};

export default useRecommendationTracking;
