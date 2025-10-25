import { Routes, Route } from 'react-router-dom';
import './App.css';
import GameFlow from './GameFlow';
import QuizLibrary from './pages/QuizLibrary';
import QuizEditor from './pages/QuizEditor';
import Analytics from './pages/Analytics';
import UserManagement from './pages/UserManagement';
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserProfile from './pages/UserProfile';
import UserDashboard from './pages/UserDashboard';
import MyQuizzes from './pages/MyQuizzes';
import CreateQuiz from './pages/CreateQuiz';
import BrowseQuizzes from './pages/BrowseQuizzes';
import CreateGame from './pages/CreateGame';
import JoinGame from './pages/JoinGame';
import DeveloperDashboard from './pages/DeveloperDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* User auth routes (public) */}
      <Route path="/login" element={<UserLogin />} />
      <Route path="/register" element={<UserRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* User dashboard and features */}
      <Route path="/" element={<UserDashboard />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/my-quizzes" element={<MyQuizzes />} />
      <Route path="/create-quiz" element={<CreateQuiz />} />
      <Route path="/edit-quiz/:id" element={<CreateQuiz />} />
      <Route path="/browse-quizzes" element={<BrowseQuizzes />} />
      <Route path="/create-game" element={<CreateGame />} />
      <Route path="/join-game" element={<JoinGame />} />

      {/* Main quiz game flow */}
      <Route path="/play" element={<GameFlow />} />

      {/* Admin routes - protected by permissions */}
      <Route
        path="/admin/quizzes"
        element={
          <ProtectedRoute requiredRole={['admin', 'developer']}>
            <QuizLibrary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/quizzes/:id"
        element={
          <ProtectedRoute requiredRole={['admin', 'developer']}>
            <QuizEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/quizzes/:id/analytics"
        element={
          <ProtectedRoute requiredRole={['admin', 'developer']}>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute requiredRole={['admin', 'developer']}>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRole={['admin', 'developer']}>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      {/* Developer dashboard (developer role only) */}
      <Route
        path="/developer"
        element={
          <ProtectedRoute requiredRole="developer">
            <DeveloperDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
