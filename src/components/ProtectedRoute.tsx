import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requiredPermission?: string | string[];
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallback = <div>Access Denied</div>,
  loading = <div>Loading...</div>,
}) => {
  const {
    permissions,
    loading: permissionsLoading,
    hasRole,
    hasPermission,
    hasAnyPermission,
  } = usePermissions();

  if (permissionsLoading) {
    return <>{loading}</>;
  }

  if (!permissions) {
    return <>{fallback}</>;
  }

  // Check role requirements
  if (requiredRole) {
    const hasRequiredRole = hasRole(requiredRole);
    if (!hasRequiredRole) {
      return <>{fallback}</>;
    }
  }

  // Check permission requirements
  if (requiredPermission) {
    const hasRequiredPermission = Array.isArray(requiredPermission)
      ? hasAnyPermission(requiredPermission)
      : hasPermission(requiredPermission);

    if (!hasRequiredPermission) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

// Convenience components for common use cases
export const DeveloperOnly: React.FC<
  Omit<ProtectedRouteProps, 'requiredRole'>
> = props => <ProtectedRoute {...props} requiredRole="developer" />;

export const AdminOnly: React.FC<
  Omit<ProtectedRouteProps, 'requiredRole'>
> = props => <ProtectedRoute {...props} requiredRole="admin" />;

export const DeveloperOrAdmin: React.FC<
  Omit<ProtectedRouteProps, 'requiredRole'>
> = props => (
  <ProtectedRoute {...props} requiredRole={['developer', 'admin']} />
);
