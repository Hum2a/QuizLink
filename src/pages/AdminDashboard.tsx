import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { FaChartLine, FaBook, FaPlusCircle, FaGamepad, FaSignOutAlt, FaArrowLeft, FaUser } from 'react-icons/fa';
import { MdDashboard, MdQuiz } from 'react-icons/md';
import { IoStatsChart } from 'react-icons/io5';
import '../styles/admin.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getUser());

  useEffect(() => {
    // Verify user is still authenticated
    authService.getCurrentUser().then(currentUser => {
      if (!currentUser) {
        navigate('/admin/login');
      } else {
        setUser(currentUser);
      }
    });
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <h1><MdDashboard className="title-icon" /> QuizLink Admin</h1>
          {user && <p className="user-email"><FaUser /> {user.name}</p>}
        </div>
        <div className="header-actions">
          <Link to="/" className="btn-secondary"><FaArrowLeft /> Back to Quiz</Link>
          <button onClick={handleLogout} className="btn-secondary">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <div className="admin-dashboard">
        <div className="dashboard-welcome">
          <h2>Welcome to QuizLink Admin, {user?.name || 'User'}!</h2>
          <p>Manage your quizzes, create new ones, and view analytics all in one place.</p>
        </div>

        <div className="dashboard-cards">
          <Link to="/admin/quizzes" className="dashboard-card">
            <div className="card-icon"><FaBook size={48} /></div>
            <h3>Quiz Library</h3>
            <p>Browse and manage all your quizzes</p>
          </Link>

          <Link to="/admin/quizzes/new" className="dashboard-card">
            <div className="card-icon"><FaPlusCircle size={48} /></div>
            <h3>Create Quiz</h3>
            <p>Build a new quiz from scratch</p>
          </Link>

          <Link to="/admin/analytics" className="dashboard-card">
            <div className="card-icon"><IoStatsChart size={48} /></div>
            <h3>Analytics</h3>
            <p>View quiz performance and stats</p>
          </Link>
        </div>

        <div className="quick-stats">
          <h3>Quick Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">0</div>
              <div className="stat-label">Total Quizzes</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">0</div>
              <div className="stat-label">Total Questions</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">0</div>
              <div className="stat-label">Games Played</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

