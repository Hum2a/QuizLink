import { Routes, Route } from 'react-router-dom';
import './App.css';
import GameFlow from './GameFlow';
import AdminDashboard from './pages/AdminDashboard';
import QuizLibrary from './pages/QuizLibrary';
import QuizEditor from './pages/QuizEditor';
import Analytics from './pages/Analytics';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import UserProfile from './pages/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* User auth routes (public) */}
      <Route path="/login" element={<UserLogin />} />
      <Route path="/register" element={<UserRegister />} />
      
      {/* Main quiz game flow (requires user login) */}
      <Route path="/" element={<GameFlow />} />
      <Route path="/profile" element={<UserProfile />} />
      
      {/* Admin auth routes (public) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      
      {/* Protected admin routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/quizzes" 
        element={
          <ProtectedRoute>
            <QuizLibrary />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/quizzes/:id" 
        element={
          <ProtectedRoute>
            <QuizEditor />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/quizzes/:id/analytics" 
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/analytics" 
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
