export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  points: number;
  requirements: AchievementRequirement[];
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export type AchievementCategory =
  | 'quiz_master'
  | 'speed_demon'
  | 'perfectionist'
  | 'explorer'
  | 'social'
  | 'creator'
  | 'streak'
  | 'special';

export type AchievementRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

export interface AchievementRequirement {
  type:
    | 'quizzes_completed'
    | 'perfect_scores'
    | 'streak_days'
    | 'categories_explored'
    | 'quizzes_created'
    | 'questions_answered'
    | 'time_under'
    | 'consecutive_correct';
  value: number;
  description: string;
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: Date;
  progress: number;
  maxProgress: number;
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  // Quiz Master Category
  {
    id: 'first_quiz',
    title: 'First Steps',
    description: 'Complete your first quiz',
    icon: '🎯',
    category: 'quiz_master',
    rarity: 'common',
    points: 10,
    requirements: [
      { type: 'quizzes_completed', value: 1, description: 'Complete 1 quiz' },
    ],
  },
  {
    id: 'quiz_novice',
    title: 'Quiz Novice',
    description: 'Complete 10 quizzes',
    icon: '📚',
    category: 'quiz_master',
    rarity: 'common',
    points: 25,
    requirements: [
      {
        type: 'quizzes_completed',
        value: 10,
        description: 'Complete 10 quizzes',
      },
    ],
  },
  {
    id: 'quiz_expert',
    title: 'Quiz Expert',
    description: 'Complete 50 quizzes',
    icon: '🎓',
    category: 'quiz_master',
    rarity: 'uncommon',
    points: 100,
    requirements: [
      {
        type: 'quizzes_completed',
        value: 50,
        description: 'Complete 50 quizzes',
      },
    ],
  },
  {
    id: 'quiz_master',
    title: 'Quiz Master',
    description: 'Complete 100 quizzes',
    icon: '👑',
    category: 'quiz_master',
    rarity: 'rare',
    points: 250,
    requirements: [
      {
        type: 'quizzes_completed',
        value: 100,
        description: 'Complete 100 quizzes',
      },
    ],
  },
  {
    id: 'quiz_legend',
    title: 'Quiz Legend',
    description: 'Complete 500 quizzes',
    icon: '🏆',
    category: 'quiz_master',
    rarity: 'legendary',
    points: 1000,
    requirements: [
      {
        type: 'quizzes_completed',
        value: 500,
        description: 'Complete 500 quizzes',
      },
    ],
  },

  // Speed Demon Category
  {
    id: 'quick_thinking',
    title: 'Quick Thinking',
    description: 'Answer 10 questions in under 30 seconds total',
    icon: '⚡',
    category: 'speed_demon',
    rarity: 'uncommon',
    points: 50,
    requirements: [
      {
        type: 'time_under',
        value: 30,
        description: 'Answer 10 questions in under 30 seconds total',
      },
    ],
  },
  {
    id: 'lightning_fast',
    title: 'Lightning Fast',
    description: 'Answer 50 questions in under 2 minutes total',
    icon: '🌩️',
    category: 'speed_demon',
    rarity: 'rare',
    points: 150,
    requirements: [
      {
        type: 'time_under',
        value: 120,
        description: 'Answer 50 questions in under 2 minutes total',
      },
    ],
  },
  {
    id: 'speed_of_light',
    title: 'Speed of Light',
    description: 'Answer 100 questions in under 3 minutes total',
    icon: '💨',
    category: 'speed_demon',
    rarity: 'epic',
    points: 300,
    requirements: [
      {
        type: 'time_under',
        value: 180,
        description: 'Answer 100 questions in under 3 minutes total',
      },
    ],
  },

  // Perfectionist Category
  {
    id: 'first_perfect',
    title: 'Perfect Score',
    description: 'Get 100% on your first quiz',
    icon: '💯',
    category: 'perfectionist',
    rarity: 'uncommon',
    points: 75,
    requirements: [
      { type: 'perfect_scores', value: 1, description: 'Get 100% on 1 quiz' },
    ],
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Get 100% on 10 quizzes',
    icon: '✨',
    category: 'perfectionist',
    rarity: 'rare',
    points: 200,
    requirements: [
      {
        type: 'perfect_scores',
        value: 10,
        description: 'Get 100% on 10 quizzes',
      },
    ],
  },
  {
    id: 'flawless_master',
    title: 'Flawless Master',
    description: 'Get 100% on 25 quizzes',
    icon: '🌟',
    category: 'perfectionist',
    rarity: 'epic',
    points: 500,
    requirements: [
      {
        type: 'perfect_scores',
        value: 25,
        description: 'Get 100% on 25 quizzes',
      },
    ],
  },
  {
    id: 'consecutive_perfect',
    title: 'Consecutive Perfect',
    description: 'Get 100% on 5 quizzes in a row',
    icon: '🔥',
    category: 'perfectionist',
    rarity: 'epic',
    points: 400,
    requirements: [
      {
        type: 'consecutive_correct',
        value: 5,
        description: 'Get 100% on 5 quizzes in a row',
      },
    ],
  },

  // Explorer Category
  {
    id: 'category_explorer',
    title: 'Category Explorer',
    description: 'Complete quizzes in 5 different categories',
    icon: '🗺️',
    category: 'explorer',
    rarity: 'uncommon',
    points: 60,
    requirements: [
      {
        type: 'categories_explored',
        value: 5,
        description: 'Complete quizzes in 5 different categories',
      },
    ],
  },
  {
    id: 'world_traveler',
    title: 'World Traveler',
    description: 'Complete quizzes in 10 different categories',
    icon: '🌍',
    category: 'explorer',
    rarity: 'rare',
    points: 150,
    requirements: [
      {
        type: 'categories_explored',
        value: 10,
        description: 'Complete quizzes in 10 different categories',
      },
    ],
  },
  {
    id: 'knowledge_seeker',
    title: 'Knowledge Seeker',
    description: 'Answer 1000 questions',
    icon: '🧠',
    category: 'explorer',
    rarity: 'rare',
    points: 200,
    requirements: [
      {
        type: 'questions_answered',
        value: 1000,
        description: 'Answer 1000 questions',
      },
    ],
  },

  // Creator Category
  {
    id: 'first_creation',
    title: 'First Creation',
    description: 'Create your first quiz',
    icon: '🛠️',
    category: 'creator',
    rarity: 'common',
    points: 30,
    requirements: [
      { type: 'quizzes_created', value: 1, description: 'Create 1 quiz' },
    ],
  },
  {
    id: 'quiz_creator',
    title: 'Quiz Creator',
    description: 'Create 5 quizzes',
    icon: '🎨',
    category: 'creator',
    rarity: 'uncommon',
    points: 100,
    requirements: [
      { type: 'quizzes_created', value: 5, description: 'Create 5 quizzes' },
    ],
  },
  {
    id: 'content_master',
    title: 'Content Master',
    description: 'Create 20 quizzes',
    icon: '📝',
    category: 'creator',
    rarity: 'rare',
    points: 300,
    requirements: [
      { type: 'quizzes_created', value: 20, description: 'Create 20 quizzes' },
    ],
  },

  // Streak Category
  {
    id: 'daily_player',
    title: 'Daily Player',
    description: 'Play quizzes for 3 days in a row',
    icon: '📅',
    category: 'streak',
    rarity: 'uncommon',
    points: 50,
    requirements: [
      {
        type: 'streak_days',
        value: 3,
        description: 'Play quizzes for 3 days in a row',
      },
    ],
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Play quizzes for 7 days in a row',
    icon: '🗓️',
    category: 'streak',
    rarity: 'rare',
    points: 150,
    requirements: [
      {
        type: 'streak_days',
        value: 7,
        description: 'Play quizzes for 7 days in a row',
      },
    ],
  },
  {
    id: 'month_master',
    title: 'Month Master',
    description: 'Play quizzes for 30 days in a row',
    icon: '📆',
    category: 'streak',
    rarity: 'epic',
    points: 500,
    requirements: [
      {
        type: 'streak_days',
        value: 30,
        description: 'Play quizzes for 30 days in a row',
      },
    ],
  },

  // Special Category
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a quiz before 8 AM',
    icon: '🐦',
    category: 'special',
    rarity: 'uncommon',
    points: 40,
    requirements: [
      {
        type: 'quizzes_completed',
        value: 1,
        description: 'Complete a quiz before 8 AM',
      },
    ],
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a quiz after 11 PM',
    icon: '🦉',
    category: 'special',
    rarity: 'uncommon',
    points: 40,
    requirements: [
      {
        type: 'quizzes_completed',
        value: 1,
        description: 'Complete a quiz after 11 PM',
      },
    ],
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Answer 100 questions correctly in a single session',
    icon: '💎',
    category: 'special',
    rarity: 'epic',
    points: 400,
    requirements: [
      {
        type: 'questions_answered',
        value: 100,
        description: 'Answer 100 questions correctly in a single session',
      },
    ],
  },
];

// Helper functions
export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(achievement => achievement.id === id);
};

export const getAchievementsByCategory = (
  category: AchievementCategory
): Achievement[] => {
  return ACHIEVEMENTS.filter(achievement => achievement.category === category);
};

export const getAchievementsByRarity = (
  rarity: AchievementRarity
): Achievement[] => {
  return ACHIEVEMENTS.filter(achievement => achievement.rarity === rarity);
};

export const getTotalPoints = (
  unlockedAchievements: UserAchievement[]
): number => {
  return unlockedAchievements.reduce((total, userAchievement) => {
    const achievement = getAchievementById(userAchievement.achievementId);
    return total + (achievement?.points || 0);
  }, 0);
};

export const getRarityColor = (rarity: AchievementRarity): string => {
  switch (rarity) {
    case 'common':
      return '#6b7280';
    case 'uncommon':
      return '#10b981';
    case 'rare':
      return '#3b82f6';
    case 'epic':
      return '#8b5cf6';
    case 'legendary':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
};

export const getRarityGradient = (rarity: AchievementRarity): string => {
  switch (rarity) {
    case 'common':
      return 'linear-gradient(135deg, #6b7280, #9ca3af)';
    case 'uncommon':
      return 'linear-gradient(135deg, #10b981, #34d399)';
    case 'rare':
      return 'linear-gradient(135deg, #3b82f6, #60a5fa)';
    case 'epic':
      return 'linear-gradient(135deg, #8b5cf6, #a78bfa)';
    case 'legendary':
      return 'linear-gradient(135deg, #f59e0b, #fbbf24)';
    default:
      return 'linear-gradient(135deg, #6b7280, #9ca3af)';
  }
};
