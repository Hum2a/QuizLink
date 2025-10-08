import { Routes, Route } from 'react-router-dom';
import './App.css';
import GameFlow from './GameFlow';
import AdminDashboard from './pages/AdminDashboard';
import QuizLibrary from './pages/QuizLibrary';
import QuizEditor from './pages/QuizEditor';
import Analytics from './pages/Analytics';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Main quiz game flow */}
      <Route path="/" element={<GameFlow />} />
      
      {/* Admin login (public) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      
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
