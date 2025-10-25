import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import {
  navigationRoutes,
  getRouteByPath,
  getPublicRoutes,
  getAuthRequiredRoutes,
  getAdminRoutes,
  getDeveloperRoutes,
  routeGroups,
  type AppRoute,
} from '../navigation';

export const useNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get current route information
  const getCurrentRoute = useCallback(() => {
    return getRouteByPath(location.pathname);
  }, [location.pathname]);

  // Navigation helpers
  const goToDashboard = useCallback(() => {
    navigate(routeGroups.user.dashboard);
  }, [navigate]);

  const goToProfile = useCallback(() => {
    navigate(routeGroups.user.profile);
  }, [navigate]);

  const goToMyQuizzes = useCallback(() => {
    navigate(routeGroups.user.myQuizzes);
  }, [navigate]);

  const goToCreateQuiz = useCallback(() => {
    navigate(routeGroups.user.createQuiz);
  }, [navigate]);

  const goToBrowseQuizzes = useCallback(() => {
    navigate(routeGroups.user.browseQuizzes);
  }, [navigate]);

  const goToCreateGame = useCallback(() => {
    navigate(routeGroups.user.createGame);
  }, [navigate]);

  const goToJoinGame = useCallback(() => {
    navigate(routeGroups.user.joinGame);
  }, [navigate]);

  // Admin navigation
  const goToQuizManagement = useCallback(() => {
    navigate(routeGroups.admin.quizzes);
  }, [navigate]);

  const goToAnalytics = useCallback(() => {
    navigate(routeGroups.admin.analytics);
  }, [navigate]);

  const goToUserManagement = useCallback(() => {
    navigate(routeGroups.admin.users);
  }, [navigate]);

  // Developer navigation
  const goToDeveloperDashboard = useCallback(() => {
    navigate(routeGroups.developer.dashboard);
  }, [navigate]);

  // Auth navigation
  const goToLogin = useCallback(() => {
    navigate(routeGroups.auth.login);
  }, [navigate]);

  const goToRegister = useCallback(() => {
    navigate(routeGroups.auth.register);
  }, [navigate]);

  // Generic navigation
  const goTo = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Route checking helpers
  const isCurrentPath = useCallback(
    (path: string) => {
      return location.pathname === path;
    },
    [location.pathname]
  );

  const isCurrentPathStartsWith = useCallback(
    (path: string) => {
      return location.pathname.startsWith(path);
    },
    [location.pathname]
  );

  const isPublicRoute = useCallback(() => {
    const currentRoute = getCurrentRoute();
    return currentRoute?.isPublic || false;
  }, [getCurrentRoute]);

  const isAuthRequired = useCallback(() => {
    const currentRoute = getCurrentRoute();
    return currentRoute?.requiresAuth || false;
  }, [getCurrentRoute]);

  const getRequiredRole = useCallback(() => {
    const currentRoute = getCurrentRoute();
    return currentRoute?.requiredRole;
  }, [getCurrentRoute]);

  // Get available routes based on user permissions
  const getAvailableRoutes = useCallback((userRoles: string[] = []) => {
    return navigationRoutes.filter(route => {
      // Public routes are always available
      if (route.isPublic) return true;

      // Auth required routes need authentication
      if (route.requiresAuth && userRoles.length === 0) return false;

      // Role-based routes need specific roles
      if (route.requiredRole) {
        if (typeof route.requiredRole === 'string') {
          return userRoles.includes(route.requiredRole);
        } else {
          return route.requiredRole.some(role => userRoles.includes(role));
        }
      }

      return true;
    });
  }, []);

  // Get navigation menu items for a user
  const getNavigationMenu = useCallback(
    (userRoles: string[] = []) => {
      const availableRoutes = getAvailableRoutes(userRoles);

      return {
        user: availableRoutes.filter(
          route =>
            route.path.startsWith('/') &&
            !route.path.startsWith('/admin') &&
            !route.path.startsWith('/developer') &&
            !route.isPublic
        ),
        admin: availableRoutes.filter(route => route.path.startsWith('/admin')),
        developer: availableRoutes.filter(route =>
          route.path.startsWith('/developer')
        ),
      };
    },
    [getAvailableRoutes]
  );

  return {
    // Current location info
    currentPath: location.pathname,
    getCurrentRoute,

    // Navigation functions
    goToDashboard,
    goToProfile,
    goToMyQuizzes,
    goToCreateQuiz,
    goToBrowseQuizzes,
    goToCreateGame,
    goToJoinGame,
    goToQuizManagement,
    goToAnalytics,
    goToUserManagement,
    goToDeveloperDashboard,
    goToLogin,
    goToRegister,
    goTo,
    goBack,

    // Route checking
    isCurrentPath,
    isCurrentPathStartsWith,
    isPublicRoute,
    isAuthRequired,
    getRequiredRole,

    // Route data
    getAvailableRoutes,
    getNavigationMenu,

    // Static data
    routes: navigationRoutes,
    routeGroups,
  };
};

export default useNavigation;
