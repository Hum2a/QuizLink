import { RouteObject } from 'react-router-dom';
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

export interface NavigationRoute extends RouteObject {
  path: string;
  element: React.ReactElement;
  title?: string;
  description?: string;
  requiresAuth?: boolean;
  requiredRole?: string | string[];
  isPublic?: boolean;
}

export const navigationRoutes: NavigationRoute[] = [
  // Public authentication routes
  {
    path: '/login',
    element: <UserLogin />,
    title: 'Login',
    description: 'Sign in to your account',
    isPublic: true,
  },
  {
    path: '/register',
    element: <UserRegister />,
    title: 'Register',
    description: 'Create a new account',
    isPublic: true,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
    title: 'Forgot Password',
    description: 'Reset your password',
    isPublic: true,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
    title: 'Reset Password',
    description: 'Set a new password',
    isPublic: true,
  },

  // Main dashboard and user features
  {
    path: '/',
    element: <UserDashboard />,
    title: 'Dashboard',
    description: 'Main user dashboard',
    requiresAuth: true,
  },
  {
    path: '/dashboard',
    element: <UserDashboard />,
    title: 'Dashboard',
    description: 'Main user dashboard',
    requiresAuth: true,
  },
  {
    path: '/profile',
    element: <UserProfile />,
    title: 'Profile',
    description: 'User profile and settings',
    requiresAuth: true,
  },
  {
    path: '/my-quizzes',
    element: <MyQuizzes />,
    title: 'My Quizzes',
    description: 'View and manage your quizzes',
    requiresAuth: true,
  },
  {
    path: '/create-quiz',
    element: <CreateQuiz />,
    title: 'Create Quiz',
    description: 'Create a new quiz',
    requiresAuth: true,
  },
  {
    path: '/edit-quiz/:id',
    element: <CreateQuiz />,
    title: 'Edit Quiz',
    description: 'Edit an existing quiz',
    requiresAuth: true,
  },
  {
    path: '/browse-quizzes',
    element: <BrowseQuizzes />,
    title: 'Browse Quizzes',
    description: 'Discover public quizzes',
    requiresAuth: true,
  },
  {
    path: '/create-game',
    element: <CreateGame />,
    title: 'Create Game',
    description: 'Start a new quiz game',
    requiresAuth: true,
  },
  {
    path: '/join-game',
    element: <JoinGame />,
    title: 'Join Game',
    description: 'Join an existing quiz game',
    requiresAuth: true,
  },

  // Main quiz game flow
  {
    path: '/play',
    element: <GameFlow />,
    title: 'Play Quiz',
    description: 'Active quiz game',
    requiresAuth: true,
  },

  // Admin routes - protected by permissions
  {
    path: '/admin/quizzes',
    element: (
      <ProtectedRoute requiredRole={['admin', 'developer']}>
        <QuizLibrary />
      </ProtectedRoute>
    ),
    title: 'Quiz Management',
    description: 'Manage all quizzes and questions',
    requiresAuth: true,
    requiredRole: ['admin', 'developer'],
  },
  {
    path: '/admin/quizzes/:id',
    element: (
      <ProtectedRoute requiredRole={['admin', 'developer']}>
        <QuizEditor />
      </ProtectedRoute>
    ),
    title: 'Edit Quiz',
    description: 'Edit quiz details and questions',
    requiresAuth: true,
    requiredRole: ['admin', 'developer'],
  },
  {
    path: '/admin/quizzes/:id/analytics',
    element: (
      <ProtectedRoute requiredRole={['admin', 'developer']}>
        <Analytics />
      </ProtectedRoute>
    ),
    title: 'Quiz Analytics',
    description: 'View detailed quiz analytics',
    requiresAuth: true,
    requiredRole: ['admin', 'developer'],
  },
  {
    path: '/admin/analytics',
    element: (
      <ProtectedRoute requiredRole={['admin', 'developer']}>
        <Analytics />
      </ProtectedRoute>
    ),
    title: 'System Analytics',
    description: 'View system-wide analytics',
    requiresAuth: true,
    requiredRole: ['admin', 'developer'],
  },
  {
    path: '/admin/users',
    element: (
      <ProtectedRoute requiredRole={['admin', 'developer']}>
        <UserManagement />
      </ProtectedRoute>
    ),
    title: 'User Management',
    description: 'Manage users and roles',
    requiresAuth: true,
    requiredRole: ['admin', 'developer'],
  },

  // Developer dashboard (developer role only)
  {
    path: '/developer',
    element: (
      <ProtectedRoute requiredRole="developer">
        <DeveloperDashboard />
      </ProtectedRoute>
    ),
    title: 'Developer Tools',
    description: 'Advanced system management',
    requiresAuth: true,
    requiredRole: 'developer',
  },
];

// Helper functions for navigation
export const getRouteByPath = (path: string): NavigationRoute | undefined => {
  return navigationRoutes.find(route => route.path === path);
};

export const getPublicRoutes = (): NavigationRoute[] => {
  return navigationRoutes.filter(route => route.isPublic);
};

export const getAuthRequiredRoutes = (): NavigationRoute[] => {
  return navigationRoutes.filter(route => route.requiresAuth);
};

export const getAdminRoutes = (): NavigationRoute[] => {
  return navigationRoutes.filter(route => route.requiredRole);
};

export const getDeveloperRoutes = (): NavigationRoute[] => {
  return navigationRoutes.filter(route => route.requiredRole === 'developer');
};

// Route groups for easier navigation
export const routeGroups = {
  auth: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
  },
  user: {
    dashboard: '/dashboard',
    profile: '/profile',
    myQuizzes: '/my-quizzes',
    createQuiz: '/create-quiz',
    browseQuizzes: '/browse-quizzes',
    createGame: '/create-game',
    joinGame: '/join-game',
  },
  admin: {
    quizzes: '/admin/quizzes',
    analytics: '/admin/analytics',
    users: '/admin/users',
  },
  developer: {
    dashboard: '/developer',
  },
  game: {
    play: '/play',
  },
};

// Navigation breadcrumbs helper
export const getBreadcrumbs = (
  currentPath: string
): Array<{ label: string; path: string }> => {
  const breadcrumbs: Array<{ label: string; path: string }> = [];

  // Always start with dashboard
  breadcrumbs.push({ label: 'Dashboard', path: '/dashboard' });

  // Add specific breadcrumbs based on current path
  if (currentPath.startsWith('/admin/quizzes')) {
    breadcrumbs.push({ label: 'Quiz Management', path: '/admin/quizzes' });

    if (currentPath.includes('/analytics')) {
      breadcrumbs.push({ label: 'Analytics', path: currentPath });
    } else if (currentPath !== '/admin/quizzes') {
      breadcrumbs.push({ label: 'Edit Quiz', path: currentPath });
    }
  } else if (currentPath.startsWith('/admin/')) {
    const route = getRouteByPath(currentPath);
    if (route) {
      breadcrumbs.push({ label: route.title || 'Admin', path: currentPath });
    }
  } else if (currentPath === '/developer') {
    breadcrumbs.push({ label: 'Developer Tools', path: '/developer' });
  } else if (currentPath !== '/dashboard') {
    const route = getRouteByPath(currentPath);
    if (route) {
      breadcrumbs.push({ label: route.title || 'Page', path: currentPath });
    }
  }

  return breadcrumbs;
};

export default navigationRoutes;
