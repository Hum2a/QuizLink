import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  createRecommendationEngine,
  getRecommendationReasonIcon,
  getRecommendationReasonColor,
  type Recommendation,
  type RecommendationEngine,
  type UserPreference,
  type PlayHistoryEntry,
} from '../services/recommendationEngine';
import { userAuthService } from '../services/userAuth';

interface RecommendationContextType {
  recommendations: Recommendation[];
  userPreferences: UserPreference | null;
  loading: boolean;
  error: string | null;
  refreshRecommendations: () => Promise<void>;
  updatePreferences: (playHistory: PlayHistoryEntry) => Promise<void>;
  getCategoryRecommendations: (category: string) => Promise<Recommendation[]>;
  getDifficultyRecommendations: (
    difficulty: 'easy' | 'medium' | 'hard'
  ) => Promise<Recommendation[]>;
  getTrendingRecommendations: () => Promise<Recommendation[]>;
  getSimilarUserRecommendations: () => Promise<Recommendation[]>;
}

const RecommendationContext = createContext<
  RecommendationContextType | undefined
>(undefined);

interface RecommendationProviderProps {
  children: ReactNode;
  quizzes?: any[]; // Will be populated with actual quiz data
}

export const RecommendationProvider: React.FC<RecommendationProviderProps> = ({
  children,
  quizzes = [],
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreference | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engine, setEngine] = useState<RecommendationEngine | null>(null);

  // Initialize recommendation engine
  useEffect(() => {
    const recommendationEngine = createRecommendationEngine(quizzes);
    setEngine(recommendationEngine);
  }, [quizzes]);

  // Load user preferences and recommendations on mount
  useEffect(() => {
    if (engine && userAuthService.isAuthenticated()) {
      loadUserData();
    }
  }, [engine]);

  const loadUserData = useCallback(async () => {
    if (!engine) return;

    try {
      setLoading(true);
      setError(null);

      const userId = userAuthService.getCurrentUser()?.id;
      if (!userId) return;

      const preferences = await engine.getUserPreferences(userId);
      setUserPreferences(preferences);

      const recs = await engine.getRecommendations(userId, 10);
      setRecommendations(recs);
    } catch (err) {
      console.error('Failed to load recommendation data:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [engine]);

  const refreshRecommendations = useCallback(async () => {
    if (!engine) return;

    try {
      setLoading(true);
      setError(null);

      const userId = userAuthService.getCurrentUser()?.id;
      if (!userId) return;

      const recs = await engine.getRecommendations(userId, 10);
      setRecommendations(recs);
    } catch (err) {
      console.error('Failed to refresh recommendations:', err);
      setError('Failed to refresh recommendations');
    } finally {
      setLoading(false);
    }
  }, [engine]);

  const updatePreferences = useCallback(
    async (playHistory: PlayHistoryEntry) => {
      if (!engine) return;

      try {
        const userId = userAuthService.getCurrentUser()?.id;
        if (!userId) return;

        await engine.updateUserPreferences(userId, playHistory);

        // Refresh recommendations after updating preferences
        await refreshRecommendations();

        // Reload user preferences
        const preferences = await engine.getUserPreferences(userId);
        setUserPreferences(preferences);
      } catch (err) {
        console.error('Failed to update preferences:', err);
        setError('Failed to update preferences');
      }
    },
    [engine, refreshRecommendations]
  );

  const getCategoryRecommendations = useCallback(
    async (category: string): Promise<Recommendation[]> => {
      if (!engine) return [];

      try {
        const userId = userAuthService.getCurrentUser()?.id;
        if (!userId) return [];

        return await engine.getCategoryRecommendations(userId, category, 5);
      } catch (err) {
        console.error('Failed to get category recommendations:', err);
        return [];
      }
    },
    [engine]
  );

  const getDifficultyRecommendations = useCallback(
    async (
      difficulty: 'easy' | 'medium' | 'hard'
    ): Promise<Recommendation[]> => {
      if (!engine) return [];

      try {
        const userId = userAuthService.getCurrentUser()?.id;
        if (!userId) return [];

        return await engine.getDifficultyRecommendations(userId, difficulty, 5);
      } catch (err) {
        console.error('Failed to get difficulty recommendations:', err);
        return [];
      }
    },
    [engine]
  );

  const getTrendingRecommendations = useCallback(async (): Promise<
    Recommendation[]
  > => {
    if (!engine) return [];

    try {
      return await engine.getTrendingRecommendations(5);
    } catch (err) {
      console.error('Failed to get trending recommendations:', err);
      return [];
    }
  }, [engine]);

  const getSimilarUserRecommendations = useCallback(async (): Promise<
    Recommendation[]
  > => {
    if (!engine) return [];

    try {
      const userId = userAuthService.getCurrentUser()?.id;
      if (!userId) return [];

      return await engine.getSimilarUserRecommendations(userId, 5);
    } catch (err) {
      console.error('Failed to get similar user recommendations:', err);
      return [];
    }
  }, [engine]);

  const value: RecommendationContextType = {
    recommendations,
    userPreferences,
    loading,
    error,
    refreshRecommendations,
    updatePreferences,
    getCategoryRecommendations,
    getDifficultyRecommendations,
    getTrendingRecommendations,
    getSimilarUserRecommendations,
  };

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
};

export const useRecommendations = (): RecommendationContextType => {
  const context = useContext(RecommendationContext);
  if (context === undefined) {
    throw new Error(
      'useRecommendations must be used within a RecommendationProvider'
    );
  }
  return context;
};

export default RecommendationContext;
