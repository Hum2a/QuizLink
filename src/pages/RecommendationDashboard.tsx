import React, { useState, useEffect, useCallback } from 'react';
import {
  FaRefresh,
  FaFilter,
  FaChartBar,
  FaUsers,
  FaFire,
  FaLightbulb,
} from 'react-icons/fa';
import { useRecommendations } from '../contexts/RecommendationContext';
import RecommendationCard from '../components/RecommendationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Recommendation } from '../services/recommendationEngine';

const RecommendationDashboard: React.FC = () => {
  const {
    recommendations,
    userPreferences,
    loading,
    error,
    refreshRecommendations,
    getCategoryRecommendations,
    getDifficultyRecommendations,
    getTrendingRecommendations,
    getSimilarUserRecommendations,
  } = useRecommendations();

  const [activeTab, setActiveTab] = useState<
    'all' | 'category' | 'difficulty' | 'trending' | 'similar'
  >('all');
  const [tabRecommendations, setTabRecommendations] = useState<
    Recommendation[]
  >([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'easy' | 'medium' | 'hard' | ''
  >('');

  // Load tab-specific recommendations
  const loadTabRecommendations = useCallback(
    async (tab: string) => {
      if (!tab || tab === 'all') {
        setTabRecommendations(recommendations);
        return;
      }

      setTabLoading(true);
      try {
        let recs: Recommendation[] = [];

        switch (tab) {
          case 'category':
            if (selectedCategory) {
              recs = await getCategoryRecommendations(selectedCategory);
            }
            break;
          case 'difficulty':
            if (selectedDifficulty) {
              recs = await getDifficultyRecommendations(selectedDifficulty);
            }
            break;
          case 'trending':
            recs = await getTrendingRecommendations();
            break;
          case 'similar':
            recs = await getSimilarUserRecommendations();
            break;
        }

        setTabRecommendations(recs);
      } catch (err) {
        console.error('Failed to load tab recommendations:', err);
      } finally {
        setTabLoading(false);
      }
    },
    [
      recommendations,
      selectedCategory,
      selectedDifficulty,
      getCategoryRecommendations,
      getDifficultyRecommendations,
      getTrendingRecommendations,
      getSimilarUserRecommendations,
    ]
  );

  // Load recommendations when tab changes
  useEffect(() => {
    loadTabRecommendations(activeTab);
  }, [activeTab, loadTabRecommendations]);

  // Load recommendations when filters change
  useEffect(() => {
    if (activeTab === 'category' || activeTab === 'difficulty') {
      loadTabRecommendations(activeTab);
    }
  }, [selectedCategory, selectedDifficulty, activeTab, loadTabRecommendations]);

  const handleRefresh = useCallback(async () => {
    await refreshRecommendations();
    await loadTabRecommendations(activeTab);
  }, [refreshRecommendations, loadTabRecommendations, activeTab]);

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'all':
        return <FaLightbulb />;
      case 'category':
        return <FaFilter />;
      case 'difficulty':
        return <FaChartBar />;
      case 'trending':
        return <FaFire />;
      case 'similar':
        return <FaUsers />;
      default:
        return <FaLightbulb />;
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'all':
        return 'For You';
      case 'category':
        return 'By Category';
      case 'difficulty':
        return 'By Difficulty';
      case 'trending':
        return 'Trending';
      case 'similar':
        return 'Similar Users';
      default:
        return 'For You';
    }
  };

  const getCategories = () => {
    if (!userPreferences) return [];
    return userPreferences.categories.map(cat => cat.category);
  };

  const getDifficulties = () => {
    if (!userPreferences) return [];
    return userPreferences.difficulties.map(diff => diff.difficulty);
  };

  if (loading && recommendations.length === 0) {
    return (
      <div className="recommendation-dashboard">
        <LoadingSpinner
          message="Loading personalized recommendations..."
          size="large"
        />
      </div>
    );
  }

  return (
    <div className="recommendation-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>
            <FaLightbulb /> Personalized Recommendations
          </h1>
          <p>Discover quizzes tailored to your interests and performance</p>
        </div>
        <button
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
        >
          <FaRefresh className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {/* User Preferences Summary */}
      {userPreferences && (
        <div className="preferences-summary">
          <h3>Your Preferences</h3>
          <div className="preferences-grid">
            <div className="preference-item">
              <span className="preference-label">Favorite Category:</span>
              <span className="preference-value">
                {userPreferences.categories.length > 0
                  ? userPreferences.categories.reduce((top, current) =>
                      current.score > top.score ? current : top
                    ).category
                  : 'None yet'}
              </span>
            </div>
            <div className="preference-item">
              <span className="preference-label">Preferred Difficulty:</span>
              <span className="preference-value">
                {userPreferences.difficulties.length > 0
                  ? userPreferences.difficulties.reduce((top, current) =>
                      current.score > top.score ? current : top
                    ).difficulty
                  : 'None yet'}
              </span>
            </div>
            <div className="preference-item">
              <span className="preference-label">Quizzes Played:</span>
              <span className="preference-value">
                {userPreferences.playHistory.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        {(
          ['all', 'category', 'difficulty', 'trending', 'similar'] as const
        ).map(tab => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {getTabIcon(tab)}
            {getTabLabel(tab)}
          </button>
        ))}
      </div>

      {/* Filters */}
      {(activeTab === 'category' || activeTab === 'difficulty') && (
        <div className="filters-section">
          {activeTab === 'category' && (
            <div className="filter-group">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">Select a category</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'difficulty' && (
            <div className="filter-group">
              <label>Difficulty:</label>
              <select
                value={selectedDifficulty}
                onChange={e =>
                  setSelectedDifficulty(
                    e.target.value as 'easy' | 'medium' | 'hard' | ''
                  )
                }
                className="filter-select"
              >
                <option value="">Select a difficulty</option>
                {getDifficulties().map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="recommendations-section">
        <div className="section-header">
          <h2>
            {getTabIcon(activeTab)} {getTabLabel(activeTab)} Recommendations
          </h2>
          <span className="recommendation-count">
            {tabLoading ? 'Loading...' : `${tabRecommendations.length} quizzes`}
          </span>
        </div>

        {tabLoading ? (
          <LoadingSpinner message="Loading recommendations..." />
        ) : tabRecommendations.length > 0 ? (
          <div className="recommendations-grid">
            {tabRecommendations.map(recommendation => (
              <RecommendationCard
                key={recommendation.quizId}
                recommendation={recommendation}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaLightbulb size={64} color="var(--color-text-tertiary)" />
            <h3>No recommendations found</h3>
            <p>
              {activeTab === 'all'
                ? 'Play some quizzes to get personalized recommendations!'
                : 'Try adjusting your filters or play more quizzes to see recommendations.'}
            </p>
          </div>
        )}
      </div>

      <style>{`
        .recommendation-dashboard {
          min-height: 100vh;
          background: var(--color-background);
          padding: 2rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-content h1 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0 0 0.5rem 0;
          color: var(--color-text-primary);
          font-size: 2.5rem;
          font-weight: 700;
        }

        .header-content p {
          color: var(--color-text-secondary);
          font-size: 1.125rem;
          margin: 0;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--color-primary);
          color: var(--color-text-inverse);
          border: none;
          border-radius: var(--radius-lg);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .refresh-btn:hover:not(:disabled) {
          background: var(--color-primary-hover);
          transform: translateY(-2px);
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        .preferences-summary {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .preferences-summary h3 {
          margin: 0 0 1rem 0;
          color: var(--color-text-primary);
          font-size: 1.25rem;
        }

        .preferences-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .preference-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: var(--color-background-secondary);
          border-radius: var(--radius-md);
        }

        .preference-label {
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .preference-value {
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .tab-navigation {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--color-surface);
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .tab-button:hover {
          background: var(--color-surface-hover);
          color: var(--color-text-primary);
        }

        .tab-button.active {
          background: var(--color-primary);
          color: var(--color-text-inverse);
          border-color: var(--color-primary);
        }

        .filters-section {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .filter-group label {
          color: var(--color-text-secondary);
          font-weight: 500;
          min-width: 80px;
        }

        .filter-select {
          padding: 0.5rem 1rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-background);
          color: var(--color-text-primary);
          min-width: 200px;
        }

        .error-state {
          text-align: center;
          padding: 2rem;
          color: var(--color-error);
        }

        .retry-btn {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: var(--color-error);
          color: var(--color-text-inverse);
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
        }

        .recommendations-section {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--color-border);
        }

        .section-header h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
          color: var(--color-text-primary);
          font-size: 1.5rem;
        }

        .recommendation-count {
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--color-text-secondary);
        }

        .empty-state h3 {
          margin: 1rem 0 0.5rem 0;
          color: var(--color-text-primary);
        }

        .empty-state p {
          margin: 0;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .recommendation-dashboard {
            padding: 1rem;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .header-content h1 {
            font-size: 2rem;
          }

          .tab-navigation {
            flex-wrap: wrap;
          }

          .recommendations-grid {
            grid-template-columns: 1fr;
          }

          .preferences-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default RecommendationDashboard;
