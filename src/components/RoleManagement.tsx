import React, { useState, useEffect } from 'react';
import { FaUsers, FaCrown, FaCode, FaPlus, FaTrash } from 'react-icons/fa';
import { usePermissions } from '../hooks/usePermissions';
import { userAuthService } from '../services/userAuth';
import { config } from '../config';

interface UserWithRoles {
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

interface Role {
  id: string;
  name: 'developer' | 'admin';
  display_name: string;
  description: string;
  permissions: string[];
}

const RoleManagement: React.FC = () => {
  const { isDeveloper } = usePermissions();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    if (isDeveloper()) {
      fetchUsers();
      fetchRoles();
    }
  }, [isDeveloper]);

  const fetchUsers = async () => {
    try {
      setError(null);
      const token = userAuthService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(
        `${config.API_URL}/api/admin/users-with-roles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = userAuthService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${config.API_URL}/api/admin/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch roles');
      }

      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const assignRole = async (userId: string, roleName: string) => {
    try {
      const token = userAuthService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${config.API_URL}/api/admin/assign-role`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, roleName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign role');
      }

      fetchUsers();
      setShowAssignModal(false);
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  const removeRole = async (userId: string, roleName: string) => {
    try {
      const token = userAuthService.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${config.API_URL}/api/admin/remove-role`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, roleName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove role');
      }

      fetchUsers();
    } catch (error) {
      console.error('Error removing role:', error);
    }
  };

  if (!isDeveloper()) {
    return <div>Access denied. Developer role required.</div>;
  }

  if (loading) {
    return (
      <div className="role-management">
        <div className="loading">Loading role management...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="role-management">
        <div className="error">Error: {error}</div>
        <button onClick={() => fetchUsers()} className="btn-retry">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="role-management">
      <div className="role-management-header">
        <h2>
          <FaUsers /> Role Management
        </h2>
        <p>Manage user roles and permissions</p>
      </div>

      <div className="users-list">
        <h3>Users</h3>
        {users.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-info">
              <div className="user-name">{user.display_name}</div>
              <div className="user-email">{user.email}</div>
              <div className="user-username">@{user.username}</div>
            </div>

            <div className="user-roles">
              <h4>Roles:</h4>
              {user.roles.length > 0 ? (
                <div className="roles-list">
                  {user.roles.map(role => (
                    <div key={role.id} className="role-badge">
                      <span className={`role-name ${role.name}`}>
                        {role.name === 'developer' ? <FaCode /> : <FaCrown />}
                        {role.display_name}
                      </span>
                      <button
                        className="btn-remove-role"
                        onClick={() => removeRole(user.id, role.name)}
                        title="Remove role"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="no-roles">No roles assigned</span>
              )}

              <button
                className="btn-assign-role"
                onClick={() => {
                  setSelectedUser(user.id);
                  setShowAssignModal(true);
                }}
              >
                <FaPlus /> Assign Role
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAssignModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Assign Role</h3>
              <button
                className="btn-close"
                onClick={() => setShowAssignModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="roles-grid">
                {roles.map(role => (
                  <div key={role.id} className="role-option">
                    <div className="role-info">
                      <h4>
                        {role.name === 'developer' ? <FaCode /> : <FaCrown />}
                        {role.display_name}
                      </h4>
                      <p>{role.description}</p>
                      <div className="permissions-list">
                        <strong>Permissions:</strong>
                        <ul>
                          {role.permissions.map(permission => (
                            <li key={permission}>{permission}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <button
                      className="btn-assign"
                      onClick={() => assignRole(selectedUser, role.name)}
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .role-management .loading,
        .role-management .error {
          text-align: center;
          padding: 2rem;
          font-size: 1.1rem;
        }

        .role-management .error {
          color: #dc2626;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          margin: 1rem 0;
        }

        .role-management .btn-retry {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 1rem;
        }

        .role-management .btn-retry:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default RoleManagement;
