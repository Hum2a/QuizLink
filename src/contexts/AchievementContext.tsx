import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  ACHIEVEMENTS,
  getAchievementById,
  getTotalPoints,
  type Achievement,
  type UserAchievement,
  type AchievementRequirement,
} from '../types/achievements';

interface AchievementContextType {
  userAchievements: UserAchievement[];
  unlockedAchievements: UserAchievement[];
  lockedAchievements: Achievement[];
  totalPoints: number;
  unlockedCount: number;
  totalCount: number;
  checkAchievement: (
    requirement: AchievementRequirement,
    value: number
  ) => void;
  unlockAchievement: (achievementId: string) => void;
  getProgress: (achievementId: string) => number;
  isUnlocked: (achievementId: string) => boolean;
  getRecentUnlocks: (count?: number) => UserAchievement[];
  loading: boolean;
  error: string | null;
}

const AchievementContext = createContext<AchievementContextType | undefined>(
  undefined
);

interface AchievementProviderProps {
  children: ReactNode;
}

export const AchievementProvider: React.FC<AchievementProviderProps> = ({
  children,
}) => {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load achievements from localStorage on mount
  useEffect(() => {
    try {
      const savedAchievements = localStorage.getItem('quizlink-achievements');
      if (savedAchievements) {
        const parsed = JSON.parse(savedAchievements);
        // Convert date strings back to Date objects
        const achievementsWithDates = parsed.map(
          (achievement: UserAchievement & { unlockedAt: string }) => ({
            ...achievement,
            unlockedAt: new Date(achievement.unlockedAt),
          })
        );
        setUserAchievements(achievementsWithDates);
      }
    } catch (err) {
      console.error('Failed to load achievements:', err);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save achievements to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(
          'quizlink-achievements',
          JSON.stringify(userAchievements)
        );
      } catch (err) {
        console.error('Failed to save achievements:', err);
      }
    }
  }, [userAchievements, loading]);

  const unlockedAchievements = userAchievements.filter(
    ua => ua.progress >= ua.maxProgress
  );
  const lockedAchievements = ACHIEVEMENTS.filter(
    achievement =>
      !userAchievements.some(
        ua =>
          ua.achievementId === achievement.id && ua.progress >= ua.maxProgress
      )
  );
  const totalPoints = getTotalPoints(unlockedAchievements);
  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;

  const checkAchievement = (
    requirement: AchievementRequirement,
    value: number
  ) => {
    // Find achievements that match this requirement
    const matchingAchievements = ACHIEVEMENTS.filter(achievement =>
      achievement.requirements.some(req => req.type === requirement.type)
    );

    matchingAchievements.forEach(achievement => {
      const req = achievement.requirements.find(
        r => r.type === requirement.type
      );
      if (!req) return;

      const existingAchievement = userAchievements.find(
        ua => ua.achievementId === achievement.id
      );

      if (existingAchievement) {
        // Update existing progress
        const newProgress = Math.min(value, req.value);
        if (newProgress > existingAchievement.progress) {
          setUserAchievements(prev =>
            prev.map(ua =>
              ua.achievementId === achievement.id
                ? { ...ua, progress: newProgress }
                : ua
            )
          );
        }
      } else {
        // Create new achievement progress
        const newProgress = Math.min(value, req.value);
        const newUserAchievement: UserAchievement = {
          achievementId: achievement.id,
          unlockedAt: new Date(),
          progress: newProgress,
          maxProgress: req.value,
        };
        setUserAchievements(prev => [...prev, newUserAchievement]);
      }
    });
  };

  const unlockAchievement = (achievementId: string) => {
    const achievement = getAchievementById(achievementId);
    if (!achievement) return;

    const existingAchievement = userAchievements.find(
      ua => ua.achievementId === achievementId
    );

    if (existingAchievement) {
      // Update existing achievement
      setUserAchievements(prev =>
        prev.map(ua =>
          ua.achievementId === achievementId
            ? { ...ua, progress: ua.maxProgress, unlockedAt: new Date() }
            : ua
        )
      );
    } else {
      // Create new unlocked achievement
      const newUserAchievement: UserAchievement = {
        achievementId: achievementId,
        unlockedAt: new Date(),
        progress: achievement.requirements[0]?.value || 1,
        maxProgress: achievement.requirements[0]?.value || 1,
      };
      setUserAchievements(prev => [...prev, newUserAchievement]);
    }
  };

  const getProgress = (achievementId: string): number => {
    const userAchievement = userAchievements.find(
      ua => ua.achievementId === achievementId
    );
    if (!userAchievement) return 0;
    return userAchievement.progress;
  };

  const isUnlocked = (achievementId: string): boolean => {
    const userAchievement = userAchievements.find(
      ua => ua.achievementId === achievementId
    );
    return userAchievement
      ? userAchievement.progress >= userAchievement.maxProgress
      : false;
  };

  const getRecentUnlocks = (count: number = 5): UserAchievement[] => {
    return unlockedAchievements
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
      .slice(0, count);
  };

  const value: AchievementContextType = {
    userAchievements,
    unlockedAchievements,
    lockedAchievements,
    totalPoints,
    unlockedCount,
    totalCount,
    checkAchievement,
    unlockAchievement,
    getProgress,
    isUnlocked,
    getRecentUnlocks,
    loading,
    error,
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievements = (): AchievementContextType => {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error(
      'useAchievements must be used within an AchievementProvider'
    );
  }
  return context;
};

export default AchievementContext;
