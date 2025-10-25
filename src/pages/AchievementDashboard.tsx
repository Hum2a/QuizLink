import React, { useState } from 'react';
import { FaTrophy, FaSearch, FaStar } from 'react-icons/fa';
import { useAchievements } from '../contexts/AchievementContext';
import {
  ACHIEVEMENTS,
  type AchievementCategory,
  type AchievementRarity,
} from '../types/achievements';
import AchievementBadge from '../components/AchievementBadge';
import AchievementProgress from '../components/AchievementProgress';

const AchievementDashboard: React.FC = () => {
  const {
    unlockedAchievements,
    lockedAchievements,
    unlockedCount,
    totalCount,
  } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState<
    AchievementCategory | 'all'
  >('all');
  const [selectedRarity, setSelectedRarity] = useState<
    AchievementRarity | 'all'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  const categories: Array<AchievementCategory | 'all'> = [
    'all',
    'quiz_master',
    'speed_demon',
    'perfectionist',
    'explorer',
    'creator',
    'streak',
    'special',
  ];

  const rarities: Array<AchievementRarity | 'all'> = [
    'all',
    'common',
    'uncommon',
    'rare',
    'epic',
    'legendary',
  ];

  const getCategoryLabel = (category: AchievementCategory | 'all') => {
    switch (category) {
      case 'quiz_master':
        return 'Quiz Master';
      case 'speed_demon':
        return 'Speed Demon';
      case 'perfectionist':
        return 'Perfectionist';
      case 'explorer':
        return 'Explorer';
      case 'creator':
        return 'Creator';
      case 'streak':
        return 'Streak';
      case 'special':
        return 'Special';
      default:
        return 'All Categories';
    }
  };

  const getRarityLabel = (rarity: AchievementRarity | 'all') => {
    switch (rarity) {
      case 'common':
        return 'Common';
      case 'uncommon':
        return 'Uncommon';
      case 'rare':
        return 'Rare';
      case 'epic':
        return 'Epic';
      case 'legendary':
        return 'Legendary';
      default:
        return 'All Rarities';
    }
  };

  const filteredAchievements = ACHIEVEMENTS.filter(achievement => {
    // Category filter
    if (
      selectedCategory !== 'all' &&
      achievement.category !== selectedCategory
    ) {
      return false;
    }

    // Rarity filter
    if (selectedRarity !== 'all' && achievement.rarity !== selectedRarity) {
      return false;
    }

    // Search filter
    if (
      searchTerm &&
      !achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Unlocked only filter
    if (showUnlockedOnly) {
      const isUnlocked = unlockedAchievements.some(
        ua => ua.achievementId === achievement.id
      );
      return isUnlocked;
    }

    return true;
  });

  const unlockedFiltered = filteredAchievements.filter(achievement =>
    unlockedAchievements.some(ua => ua.achievementId === achievement.id)
  );

  const lockedFiltered = filteredAchievements.filter(
    achievement =>
      !unlockedAchievements.some(ua => ua.achievementId === achievement.id)
  );

  return (
    <div className="achievement-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>
            <FaTrophy /> Achievement Center
          </h1>
          <p>Track your progress and unlock new achievements!</p>
        </div>
        <AchievementProgress showStats={true} showRecent={true} />
      </header>

      <div className="dashboard-content">
        <div className="filters-section">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={e =>
                  setSelectedCategory(
                    e.target.value as AchievementCategory | 'all'
                  )
                }
                className="filter-select"
                aria-label="Filter by category"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {getCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Rarity:</label>
              <select
                value={selectedRarity}
                onChange={e =>
                  setSelectedRarity(e.target.value as AchievementRarity | 'all')
                }
                className="filter-select"
                aria-label="Filter by rarity"
              >
                {rarities.map(rarity => (
                  <option key={rarity} value={rarity}>
                    {getRarityLabel(rarity)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showUnlockedOnly}
                  onChange={e => setShowUnlockedOnly(e.target.checked)}
                />
                <span>Unlocked Only</span>
              </label>
            </div>
          </div>
        </div>

        <div className="achievements-section">
          <div className="section-header">
            <h2>
              <FaStar /> Achievements ({filteredAchievements.length})
            </h2>
            <div className="section-stats">
              <span className="unlocked-count">
                {unlockedFiltered.length} unlocked
              </span>
              <span className="locked-count">
                {lockedFiltered.length} locked
              </span>
            </div>
          </div>

          {unlockedFiltered.length > 0 && (
            <div className="achievement-group">
              <h3 className="group-title unlocked-title">
                🏆 Unlocked Achievements
              </h3>
              <div className="achievement-grid">
                {unlockedFiltered.map(achievement => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    size="md"
                    showProgress={false}
                    showPoints={true}
                  />
                ))}
              </div>
            </div>
          )}

          {lockedFiltered.length > 0 && (
            <div className="achievement-group">
              <h3 className="group-title locked-title">
                🔒 Locked Achievements
              </h3>
              <div className="achievement-grid">
                {lockedFiltered.map(achievement => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    size="md"
                    showProgress={true}
                    showPoints={true}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredAchievements.length === 0 && (
            <div className="empty-state">
              <FaTrophy size={64} color="var(--color-text-tertiary)" />
              <h3>No Achievements Found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .achievement-dashboard {
          min-height: 100vh;
          background: var(--color-background);
          padding: 2rem;
        }

        .dashboard-header {
          margin-bottom: 2rem;
        }

        .header-content {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header-content h1 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin: 0 0 0.5rem 0;
          color: var(--color-text-primary);
          font-size: 2.5rem;
        }

        .header-content p {
          color: var(--color-text-secondary);
          font-size: 1.125rem;
          margin: 0;
        }

        .dashboard-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .filters-section {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: var(--shadow-sm);
        }

        .search-bar {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-tertiary);
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-background);
          color: var(--color-text-primary);
          font-size: 1rem;
          transition: all var(--transition-fast);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-border-focus);
          box-shadow: 0 0 0 3px var(--color-primary-light);
        }

        .filter-controls {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-group label {
          color: var(--color-text-secondary);
          font-weight: 500;
          font-size: 0.875rem;
        }

        .filter-select {
          padding: 0.5rem 1rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-background);
          color: var(--color-text-primary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-select:focus {
          outline: none;
          border-color: var(--color-border-focus);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 1rem;
          height: 1rem;
          accent-color: var(--color-primary);
        }

        .achievements-section {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
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

        .section-stats {
          display: flex;
          gap: 1rem;
        }

        .unlocked-count {
          color: var(--color-success);
          font-weight: 600;
        }

        .locked-count {
          color: var(--color-text-secondary);
          font-weight: 600;
        }

        .achievement-group {
          margin-bottom: 2rem;
        }

        .group-title {
          margin: 0 0 1.5rem 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .unlocked-title {
          color: var(--color-success);
        }

        .locked-title {
          color: var(--color-text-secondary);
        }

        .achievement-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .achievement-dashboard {
            padding: 1rem;
          }

          .header-content h1 {
            font-size: 2rem;
          }

          .filter-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .filter-group {
            justify-content: space-between;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .achievement-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AchievementDashboard;
