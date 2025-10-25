import { useState, useEffect, useCallback } from 'react';
import { userAuthService } from '../services/userAuth';

export interface UserRole {
  id: string;
  name: 'developer' | 'admin';
  display_name: string;
  description: string;
  permissions: string[];
  assigned_at: string;
  expires_at?: string;
}

export interface UserPermissions {
  user_id: string;
  email: string;
  username: string;
  display_name: string;
  roles: UserRole[];
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = userAuthService.getToken();
      if (!token) {
        setPermissions(null);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/permissions', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const data = await response.json();
      setPermissions(data);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasRole = useCallback(
    (roles: string | string[]): boolean => {
      if (!permissions) return false;

      const roleArray = Array.isArray(roles) ? roles : [roles];
      return permissions.roles.some((role: UserRole) =>
        roleArray.includes(role.name)
      );
    },
    [permissions]
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!permissions) return false;

      return permissions.roles.some((role: UserRole) =>
        role.permissions.includes(permission)
      );
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (permissionList: string[]): boolean => {
      if (!permissions) return false;

      return permissions.roles.some((role: UserRole) =>
        permissionList.some(perm => role.permissions.includes(perm))
      );
    },
    [permissions]
  );

  const isDeveloper = useCallback((): boolean => {
    return hasRole('developer');
  }, [hasRole]);

  const isAdmin = useCallback((): boolean => {
    return hasRole('admin');
  }, [hasRole]);

  const isDeveloperOrAdmin = useCallback((): boolean => {
    return hasRole(['developer', 'admin']);
  }, [hasRole]);

  return {
    permissions,
    loading,
    error,
    refetch: fetchPermissions,
    hasRole,
    hasPermission,
    hasAnyPermission,
    isDeveloper,
    isAdmin,
    isDeveloperOrAdmin,
  };
}
