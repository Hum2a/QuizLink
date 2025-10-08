import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaPlay,
  FaBook,
  FaSearch,
  FaFilter,
} from 'react-icons/fa';
import type { QuizTemplate } from '../services/api';
import { config } from '../config';
import { userAuthService } from '../services/userAuth';
import '../styles/admin.css';

function BrowseQuizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuizTemplate[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<QuizTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    filterQuizzes();
  }, [searchTerm, categoryFilter, difficultyFilter, quizzes]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const token = userAuthService.getToken();

      if (!token) {
        navigate('/register');
        return;
      }

      const response = await fetch(
        `${config.API_URL}/api/user/quizzes/public`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load quizzes');
      }

      const data = await response.json();
      setQuizzes(data);

      // Extract unique categories
      const uniqueCategories = [
        ...new Set(data.map((q: QuizTemplate) => q.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories as string[]);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const filterQuizzes = () => {
    let filtered = [...quizzes];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        quiz =>
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(quiz => quiz.category === categoryFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(quiz => quiz.difficulty === difficultyFilter);
    }

    setFilteredQuizzes(filtered);
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading quizzes...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <Link to="/dashboard" className="btn-back">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <h1>
            <FaBook /> Browse Quizzes
          </h1>
        </div>
      </header>

      <div className="admin-dashboard">
        {error && <div className="error-message">{error}</div>}

        {/* Search and Filters */}
        <div className="search-filters">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <FaFilter />
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-count">
          Showing {filteredQuizzes.length} of {quizzes.length} quizzes
        </div>

        {/* Quiz Grid */}
        {filteredQuizzes.length === 0 ? (
          <div className="empty-state">
            <FaBook size={64} color="#cbd5e1" />
            <h2>No Quizzes Found</h2>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="quiz-grid">
            {filteredQuizzes.map(quiz => (
              <div key={quiz.id} className="quiz-card">
                <div className="quiz-header">
                  <h3>{quiz.title}</h3>
                  <span
                    className={`difficulty-badge difficulty-${quiz.difficulty}`}
                  >
                    {quiz.difficulty}
                  </span>
                </div>

                <p className="quiz-description">{quiz.description}</p>

                <div className="quiz-meta">
                  <span className="quiz-category">{quiz.category}</span>
                  <span className="quiz-stat">
                    {quiz.question_count || 0} questions
                  </span>
                  <span className="quiz-stat">
                    ⭐ Played {quiz.times_played} times
                  </span>
                </div>

                <div className="quiz-actions">
                  <Link
                    to={`/create-game?quiz=${quiz.id}`}
                    className="btn-primary btn-block"
                  >
                    <FaPlay /> Play This Quiz
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .search-filters {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .search-bar {
          position: relative;
          margin-bottom: 1rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-bar input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
        }

        .search-bar input:focus {
          outline: none;
          border-color: #667eea;
        }

        .filters {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-group select {
          padding: 0.5rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
        }

        .results-count {
          color: #6b7280;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }

        .btn-block {
          width: 100%;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

export default BrowseQuizzes;
