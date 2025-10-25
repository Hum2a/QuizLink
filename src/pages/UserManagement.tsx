import React, { useState, useEffect } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { userAuthService } from '../services/userAuth';
import { config } from '../config';
import {
  FaUsers,
  FaUserPlus,
  FaUserEdit,
  FaUserMinus,
  FaShieldAlt,
} from 'react-icons/fa';
import '../styles/admin.css';

interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  created_at: string;
  roles: Array<{
    id: string;
    name: string;
    display_name: string;
    assigned_at: string;
    expires_at?: string;
  }>;
}

const UserManagement: React.FC = () => {
  const { permissions, isDeveloper, isAdmin } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = userAuthService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${config.API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, roleName: string) => {
    try {
      const token = userAuthService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(
        `${config.API_URL}/api/admin/users/assign-role`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, roleName }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign role');
      }

      // Refresh users list
      await fetchUsers();
    } catch (err) {
      console.error('Error assigning role:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const removeRole = async (userId: string, roleName: string) => {
    try {
      const token = userAuthService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(
        `${config.API_URL}/api/admin/users/remove-role`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, roleName }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove role');
      }

      // Refresh users list
      await fetchUsers();
    } catch (err) {
      console.error('Error removing role:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <h1>
            <FaUsers /> User Management
          </h1>
          <p>Manage user accounts and roles</p>
        </div>
      </header>

      <div className="admin-dashboard">
        <div className="dashboard-welcome">
          <h2>All Users ({users.length})</h2>
          <p>View and manage user accounts and their roles</p>
        </div>

        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Username</th>
                <th>Roles</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.display_name}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>
                    <div className="user-roles">
                      {user.roles.length > 0 ? (
                        user.roles.map(role => (
                          <span
                            key={role.id}
                            className={`role-badge ${role.name}`}
                          >
                            <FaShieldAlt /> {role.display_name}
                            {(isDeveloper() || isAdmin()) && (
                              <button
                                className="remove-role-btn"
                                onClick={() => removeRole(user.id, role.name)}
                                title="Remove role"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))
                      ) : (
                        <span className="role-badge no-role">No roles</span>
                      )}
                    </div>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="user-actions">
                      {(isDeveloper() || isAdmin()) && (
                        <>
                          <button
                            className="btn-small"
                            onClick={() => assignRole(user.id, 'admin')}
                            disabled={user.roles.some(r => r.name === 'admin')}
                          >
                            <FaUserPlus /> Admin
                          </button>
                          {isDeveloper() && (
                            <button
                              className="btn-small"
                              onClick={() => assignRole(user.id, 'developer')}
                              disabled={user.roles.some(
                                r => r.name === 'developer'
                              )}
                            >
                              <FaUserPlus /> Developer
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .users-table {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .users-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th,
        .users-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        .users-table th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .user-name {
          font-weight: 500;
          color: #1f2937;
        }

        .user-roles {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          position: relative;
        }

        .role-badge.developer {
          background: #1e293b;
          color: white;
        }

        .role-badge.admin {
          background: #3b82f6;
          color: white;
        }

        .role-badge.no-role {
          background: #e5e7eb;
          color: #6b7280;
        }

        .remove-role-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          cursor: pointer;
          margin-left: 0.25rem;
        }

        .remove-role-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .user-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-small {
          padding: 0.25rem 0.5rem;
          font-size: 0.8rem;
          border-radius: 4px;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .btn-small:hover:not(:disabled) {
          background: #f3f4f6;
        }

        .btn-small:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
