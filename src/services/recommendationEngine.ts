export interface UserPreference {
  userId: string;
  categories: CategoryPreference[];
  difficulties: DifficultyPreference[];
  topics: TopicPreference[];
  playHistory: PlayHistoryEntry[];
  lastUpdated: Date;
}

export interface CategoryPreference {
  category: string;
  score: number; // 0-100, higher = more preferred
  playCount: number;
  averageScore: number;
  lastPlayed: Date;
}

export interface DifficultyPreference {
  difficulty: 'easy' | 'medium' | 'hard';
  score: number; // 0-100
  playCount: number;
  averageScore: number;
  lastPlayed: Date;
}

export interface TopicPreference {
  topic: string;
  score: number; // 0-100
  playCount: number;
  averageScore: number;
  lastPlayed: Date;
}

export interface PlayHistoryEntry {
  quizId: string;
  quizTitle: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
  score: number;
  totalQuestions: number;
  timeSpent: number;
  playedAt: Date;
  completed: boolean;
}

export interface Recommendation {
  quizId: string;
  quizTitle: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
  score: number; // 0-100, recommendation confidence
  reason: RecommendationReason;
  explanation: string;
}

export interface RecommendationReason {
  type:
    | 'category_preference'
    | 'difficulty_match'
    | 'topic_interest'
    | 'similar_users'
    | 'trending'
    | 'new_content'
    | 'performance_based';
  confidence: number; // 0-100
  description: string;
}

export interface RecommendationEngine {
  getUserPreferences: (userId: string) => Promise<UserPreference | null>;
  updateUserPreferences: (
    userId: string,
    playHistory: PlayHistoryEntry
  ) => Promise<void>;
  getRecommendations: (
    userId: string,
    limit?: number
  ) => Promise<Recommendation[]>;
  getCategoryRecommendations: (
    userId: string,
    category: string,
    limit?: number
  ) => Promise<Recommendation[]>;
  getDifficultyRecommendations: (
    userId: string,
    difficulty: 'easy' | 'medium' | 'hard',
    limit?: number
  ) => Promise<Recommendation[]>;
  getTrendingRecommendations: (limit?: number) => Promise<Recommendation[]>;
  getSimilarUserRecommendations: (
    userId: string,
    limit?: number
  ) => Promise<Recommendation[]>;
}

// Recommendation algorithms
export class QuizRecommendationEngine implements RecommendationEngine {
  private preferences: Map<string, UserPreference> = new Map();
  private allQuizzes: any[] = []; // Will be populated with actual quiz data

  constructor(quizzes: any[] = []) {
    this.allQuizzes = quizzes;
    this.loadPreferences();
  }

  private loadPreferences(): void {
    try {
      const saved = localStorage.getItem('quizlink-user-preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.entries(parsed).forEach(([userId, prefs]: [string, any]) => {
          this.preferences.set(userId, {
            ...prefs,
            lastUpdated: new Date(prefs.lastUpdated),
            categories: prefs.categories.map((cat: any) => ({
              ...cat,
              lastPlayed: new Date(cat.lastPlayed),
            })),
            difficulties: prefs.difficulties.map((diff: any) => ({
              ...diff,
              lastPlayed: new Date(diff.lastPlayed),
            })),
            topics: prefs.topics.map((topic: any) => ({
              ...topic,
              lastPlayed: new Date(topic.lastPlayed),
            })),
            playHistory: prefs.playHistory.map((entry: any) => ({
              ...entry,
              playedAt: new Date(entry.playedAt),
            })),
          });
        });
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  }

  private savePreferences(): void {
    try {
      const toSave: Record<string, any> = {};
      this.preferences.forEach((prefs, userId) => {
        toSave[userId] = {
          ...prefs,
          lastUpdated: prefs.lastUpdated.toISOString(),
          categories: prefs.categories.map(cat => ({
            ...cat,
            lastPlayed: cat.lastPlayed.toISOString(),
          })),
          difficulties: prefs.difficulties.map(diff => ({
            ...diff,
            lastPlayed: diff.lastPlayed.toISOString(),
          })),
          topics: prefs.topics.map(topic => ({
            ...topic,
            lastPlayed: topic.lastPlayed.toISOString(),
          })),
          playHistory: prefs.playHistory.map(entry => ({
            ...entry,
            playedAt: entry.playedAt.toISOString(),
          })),
        };
      });
      localStorage.setItem('quizlink-user-preferences', JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreference | null> {
    return this.preferences.get(userId) || null;
  }

  async updateUserPreferences(
    userId: string,
    playHistory: PlayHistoryEntry
  ): Promise<void> {
    let userPrefs = this.preferences.get(userId);

    if (!userPrefs) {
      userPrefs = {
        userId,
        categories: [],
        difficulties: [],
        topics: [],
        playHistory: [],
        lastUpdated: new Date(),
      };
    }

    // Add to play history
    userPrefs.playHistory.unshift(playHistory);

    // Keep only last 100 entries
    if (userPrefs.playHistory.length > 100) {
      userPrefs.playHistory = userPrefs.playHistory.slice(0, 100);
    }

    // Update category preferences
    this.updateCategoryPreference(userPrefs, playHistory);

    // Update difficulty preferences
    this.updateDifficultyPreference(userPrefs, playHistory);

    // Update topic preferences
    this.updateTopicPreference(userPrefs, playHistory);

    userPrefs.lastUpdated = new Date();
    this.preferences.set(userId, userPrefs);
    this.savePreferences();
  }

  private updateCategoryPreference(
    prefs: UserPreference,
    entry: PlayHistoryEntry
  ): void {
    const existing = prefs.categories.find(
      cat => cat.category === entry.category
    );

    if (existing) {
      existing.playCount++;
      existing.averageScore =
        (existing.averageScore * (existing.playCount - 1) + entry.score) /
        existing.playCount;
      existing.lastPlayed = entry.playedAt;
      existing.score = Math.min(100, existing.score + 5); // Boost preference
    } else {
      prefs.categories.push({
        category: entry.category,
        score: 50 + (entry.score / entry.totalQuestions) * 30, // Base score + performance bonus
        playCount: 1,
        averageScore: entry.score,
        lastPlayed: entry.playedAt,
      });
    }
  }

  private updateDifficultyPreference(
    prefs: UserPreference,
    entry: PlayHistoryEntry
  ): void {
    const existing = prefs.difficulties.find(
      diff => diff.difficulty === entry.difficulty
    );

    if (existing) {
      existing.playCount++;
      existing.averageScore =
        (existing.averageScore * (existing.playCount - 1) + entry.score) /
        existing.playCount;
      existing.lastPlayed = entry.playedAt;
      existing.score = Math.min(100, existing.score + 3); // Smaller boost for difficulty
    } else {
      prefs.difficulties.push({
        difficulty: entry.difficulty,
        score: 40 + (entry.score / entry.totalQuestions) * 40,
        playCount: 1,
        averageScore: entry.score,
        lastPlayed: entry.playedAt,
      });
    }
  }

  private updateTopicPreference(
    prefs: UserPreference,
    entry: PlayHistoryEntry
  ): void {
    entry.topics.forEach(topic => {
      const existing = prefs.topics.find(t => t.topic === topic);

      if (existing) {
        existing.playCount++;
        existing.averageScore =
          (existing.averageScore * (existing.playCount - 1) + entry.score) /
          existing.playCount;
        existing.lastPlayed = entry.playedAt;
        existing.score = Math.min(100, existing.score + 2);
      } else {
        prefs.topics.push({
          topic,
          score: 30 + (entry.score / entry.totalQuestions) * 50,
          playCount: 1,
          averageScore: entry.score,
          lastPlayed: entry.playedAt,
        });
      }
    });
  }

  async getRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<Recommendation[]> {
    const userPrefs = await this.getUserPreferences(userId);
    const recommendations: Recommendation[] = [];

    if (!userPrefs || userPrefs.playHistory.length === 0) {
      // New user - return trending quizzes
      return this.getTrendingRecommendations(limit);
    }

    // Category-based recommendations
    const categoryRecs = await this.getCategoryRecommendations(
      userId,
      '',
      limit
    );
    recommendations.push(...categoryRecs);

    // Difficulty-based recommendations
    const difficultyRecs = await this.getDifficultyRecommendations(
      userId,
      '',
      limit
    );
    recommendations.push(...difficultyRecs);

    // Performance-based recommendations
    const performanceRecs = this.getPerformanceBasedRecommendations(
      userPrefs,
      limit
    );
    recommendations.push(...performanceRecs);

    // Remove duplicates and sort by score
    const uniqueRecs = this.removeDuplicateRecommendations(recommendations);
    return uniqueRecs.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  async getCategoryRecommendations(
    userId: string,
    category: string,
    limit: number = 5
  ): Promise<Recommendation[]> {
    const userPrefs = await this.getUserPreferences(userId);
    if (!userPrefs) return [];

    const targetCategory = category || this.getTopCategory(userPrefs);
    if (!targetCategory) return [];

    const categoryPref = userPrefs.categories.find(
      cat => cat.category === targetCategory
    );
    if (!categoryPref) return [];

    const categoryQuizzes = this.allQuizzes.filter(
      quiz =>
        quiz.category === targetCategory &&
        !this.hasPlayedQuiz(userPrefs, quiz.id)
    );

    return categoryQuizzes
      .map(quiz => ({
        quizId: quiz.id,
        quizTitle: quiz.title,
        category: quiz.category,
        difficulty: quiz.difficulty,
        topics: quiz.topics || [],
        score: categoryPref.score,
        reason: {
          type: 'category_preference' as const,
          confidence: categoryPref.score,
          description: `Based on your interest in ${targetCategory}`,
        },
        explanation: `You've played ${
          categoryPref.playCount
        } ${targetCategory} quizzes with ${Math.round(
          categoryPref.averageScore
        )}% average score`,
      }))
      .slice(0, limit);
  }

  async getDifficultyRecommendations(
    userId: string,
    difficulty: string,
    limit: number = 5
  ): Promise<Recommendation[]> {
    const userPrefs = await this.getUserPreferences(userId);
    if (!userPrefs) return [];

    const targetDifficulty = difficulty || this.getOptimalDifficulty(userPrefs);
    if (!targetDifficulty) return [];

    const difficultyPref = userPrefs.difficulties.find(
      diff => diff.difficulty === targetDifficulty
    );
    if (!difficultyPref) return [];

    const difficultyQuizzes = this.allQuizzes.filter(
      quiz =>
        quiz.difficulty === targetDifficulty &&
        !this.hasPlayedQuiz(userPrefs, quiz.id)
    );

    return difficultyQuizzes
      .map(quiz => ({
        quizId: quiz.id,
        quizTitle: quiz.title,
        category: quiz.category,
        difficulty: quiz.difficulty,
        topics: quiz.topics || [],
        score: difficultyPref.score,
        reason: {
          type: 'difficulty_match' as const,
          confidence: difficultyPref.score,
          description: `Matches your ${targetDifficulty} difficulty preference`,
        },
        explanation: `You perform well on ${targetDifficulty} quizzes (${Math.round(
          difficultyPref.averageScore
        )}% average)`,
      }))
      .slice(0, limit);
  }

  async getTrendingRecommendations(
    limit: number = 5
  ): Promise<Recommendation[]> {
    // Sort by play count and recent activity
    const trendingQuizzes = [...this.allQuizzes]
      .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
      .slice(0, limit);

    return trendingQuizzes.map(quiz => ({
      quizId: quiz.id,
      quizTitle: quiz.title,
      category: quiz.category,
      difficulty: quiz.difficulty,
      topics: quiz.topics || [],
      score: 75, // High score for trending
      reason: {
        type: 'trending' as const,
        confidence: 75,
        description: 'Popular among other users',
      },
      explanation: `Played by ${quiz.play_count || 0} users`,
    }));
  }

  async getSimilarUserRecommendations(
    userId: string,
    limit: number = 5
  ): Promise<Recommendation[]> {
    // Simplified collaborative filtering
    const userPrefs = await this.getUserPreferences(userId);
    if (!userPrefs) return [];

    const similarUsers = this.findSimilarUsers(userPrefs);
    const recommendedQuizzes = this.getQuizzesFromSimilarUsers(
      similarUsers,
      userPrefs
    );

    return recommendedQuizzes.slice(0, limit);
  }

  private getPerformanceBasedRecommendations(
    userPrefs: UserPreference,
    limit: number
  ): Recommendation[] {
    const recentHistory = userPrefs.playHistory.slice(0, 10);
    const avgScore =
      recentHistory.reduce((sum, entry) => sum + entry.score, 0) /
      recentHistory.length;

    // Recommend quizzes that match performance level
    const performanceQuizzes = this.allQuizzes.filter(quiz => {
      const difficultyScore = this.getDifficultyScore(quiz.difficulty);
      return (
        Math.abs(difficultyScore - avgScore) < 20 &&
        !this.hasPlayedQuiz(userPrefs, quiz.id)
      );
    });

    return performanceQuizzes
      .map(quiz => ({
        quizId: quiz.id,
        quizTitle: quiz.title,
        category: quiz.category,
        difficulty: quiz.difficulty,
        topics: quiz.topics || [],
        score: 60,
        reason: {
          type: 'performance_based' as const,
          confidence: 60,
          description: 'Matches your performance level',
        },
        explanation: `Based on your recent ${Math.round(
          avgScore
        )}% average score`,
      }))
      .slice(0, limit);
  }

  private getTopCategory(userPrefs: UserPreference): string | null {
    if (userPrefs.categories.length === 0) return null;
    return userPrefs.categories.reduce((top, current) =>
      current.score > top.score ? current : top
    ).category;
  }

  private getOptimalDifficulty(userPrefs: UserPreference): string | null {
    if (userPrefs.difficulties.length === 0) return null;
    return userPrefs.difficulties.reduce((top, current) =>
      current.score > top.score ? current : top
    ).difficulty;
  }

  private hasPlayedQuiz(userPrefs: UserPreference, quizId: string): boolean {
    return userPrefs.playHistory.some(entry => entry.quizId === quizId);
  }

  private getDifficultyScore(difficulty: string): number {
    switch (difficulty) {
      case 'easy':
        return 80;
      case 'medium':
        return 60;
      case 'hard':
        return 40;
      default:
        return 60;
    }
  }

  private findSimilarUsers(userPrefs: UserPreference): UserPreference[] {
    // Simplified similarity based on category preferences
    const similarUsers: UserPreference[] = [];

    this.preferences.forEach((prefs, userId) => {
      if (userId === userPrefs.userId) return;

      const similarity = this.calculateSimilarity(userPrefs, prefs);
      if (similarity > 0.3) {
        similarUsers.push(prefs);
      }
    });

    return similarUsers
      .sort(
        (a, b) =>
          this.calculateSimilarity(userPrefs, b) -
          this.calculateSimilarity(userPrefs, a)
      )
      .slice(0, 5);
  }

  private calculateSimilarity(
    userPrefs1: UserPreference,
    userPrefs2: UserPreference
  ): number {
    const categories1 = new Set(userPrefs1.categories.map(c => c.category));
    const categories2 = new Set(userPrefs2.categories.map(c => c.category));

    const intersection = new Set(
      [...categories1].filter(c => categories2.has(c))
    );
    const union = new Set([...categories1, ...categories2]);

    return intersection.size / union.size;
  }

  private getQuizzesFromSimilarUsers(
    similarUsers: UserPreference[],
    userPrefs: UserPreference
  ): Recommendation[] {
    const recommendedQuizIds = new Set<string>();

    similarUsers.forEach(user => {
      user.playHistory.forEach(entry => {
        if (!this.hasPlayedQuiz(userPrefs, entry.quizId)) {
          recommendedQuizIds.add(entry.quizId);
        }
      });
    });

    return Array.from(recommendedQuizIds)
      .map(quizId => {
        const quiz = this.allQuizzes.find(q => q.id === quizId);
        if (!quiz) return null;

        return {
          quizId: quiz.id,
          quizTitle: quiz.title,
          category: quiz.category,
          difficulty: quiz.difficulty,
          topics: quiz.topics || [],
          score: 70,
          reason: {
            type: 'similar_users' as const,
            confidence: 70,
            description: 'Liked by users with similar interests',
          },
          explanation: 'Users with similar quiz preferences enjoyed this',
        };
      })
      .filter(Boolean) as Recommendation[];
  }

  private removeDuplicateRecommendations(
    recommendations: Recommendation[]
  ): Recommendation[] {
    const seen = new Set<string>();
    return recommendations.filter(rec => {
      if (seen.has(rec.quizId)) return false;
      seen.add(rec.quizId);
      return true;
    });
  }
}

// Helper functions
export const createRecommendationEngine = (
  quizzes: any[]
): RecommendationEngine => {
  return new QuizRecommendationEngine(quizzes);
};

export const getRecommendationReasonIcon = (
  reason: RecommendationReason
): string => {
  switch (reason.type) {
    case 'category_preference':
      return '📚';
    case 'difficulty_match':
      return '🎯';
    case 'topic_interest':
      return '🔍';
    case 'similar_users':
      return '👥';
    case 'trending':
      return '🔥';
    case 'new_content':
      return '✨';
    case 'performance_based':
      return '📊';
    default:
      return '💡';
  }
};

export const getRecommendationReasonColor = (
  reason: RecommendationReason
): string => {
  switch (reason.type) {
    case 'category_preference':
      return 'var(--color-primary)';
    case 'difficulty_match':
      return 'var(--color-success)';
    case 'topic_interest':
      return 'var(--color-info)';
    case 'similar_users':
      return 'var(--color-warning)';
    case 'trending':
      return 'var(--color-error)';
    case 'new_content':
      return 'var(--color-secondary)';
    case 'performance_based':
      return 'var(--color-primary)';
    default:
      return 'var(--color-text-secondary)';
  }
};
