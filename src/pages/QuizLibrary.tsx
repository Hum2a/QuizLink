import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../services/api';
import type { QuizTemplate } from '../services/api';
import { FaBook, FaPlusCircle, FaEdit, FaTrash, FaSearch, FaArrowLeft, FaFileAlt, FaGamepad } from 'react-icons/fa';
import { IoStatsChart } from 'react-icons/io5';
import { MdQuiz } from 'react-icons/md';
import '../styles/admin.css';

function QuizLibrary() {
  const [quizzes, setQuizzes] = useState<QuizTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizAPI.getAllQuizzes();
      setQuizzes(data);
    } catch (err) {
      setError('Failed to load quizzes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      await quizAPI.deleteQuiz(id);
      setQuizzes(quizzes.filter(q => q.id !== id));
    } catch (err) {
      alert('Failed to delete quiz');
      console.error(err);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || quiz.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(quizzes.map(q => q.category).filter(Boolean))];

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
          <Link to="/admin" className="btn-back"><FaArrowLeft /> Dashboard</Link>
          <h1><FaBook /> Quiz Library</h1>
        </div>
        <Link to="/admin/quizzes/new" className="btn-primary">
          <FaPlusCircle /> Create New Quiz
        </Link>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="quiz-library">
        <div className="library-controls">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-filter"
            aria-label="Filter by category"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {filteredQuizzes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><MdQuiz size={100} /></div>
            <h2>No Quizzes Found</h2>
            <p>Create your first quiz to get started!</p>
            <Link to="/admin/quizzes/new" className="btn-primary">
              <FaPlusCircle /> Create Quiz
            </Link>
          </div>
        ) : (
          <div className="quiz-grid">
            {filteredQuizzes.map(quiz => (
              <div key={quiz.id} className="quiz-card">
                <div className="quiz-card-header">
                  <h3>{quiz.title}</h3>
                  <span 
                    className={`difficulty-badge difficulty-${quiz.difficulty}`}
                  >
                    {quiz.difficulty}
                  </span>
                </div>
                
                <p className="quiz-description">{quiz.description}</p>
                
                <div className="quiz-meta">
                  <span className="quiz-stat">
                    <FaFileAlt /> {quiz.question_count || 0} questions
                  </span>
                  <span className="quiz-stat">
                    <FaGamepad /> {quiz.times_played} plays
                  </span>
                </div>

                {quiz.category && (
                  <div className="quiz-category">{quiz.category}</div>
                )}

                <div className="quiz-actions">
                  <Link 
                    to={`/admin/quizzes/${quiz.id}`}
                    className="btn-edit"
                  >
                    <FaEdit /> Edit
                  </Link>
                  <Link 
                    to={`/admin/quizzes/${quiz.id}/analytics`}
                    className="btn-analytics"
                  >
                    <IoStatsChart /> Stats
                  </Link>
                  <button 
                    onClick={() => handleDelete(quiz.id, quiz.title)}
                    className="btn-delete"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizLibrary;

