import React, { useState, useEffect } from 'react';
import { FaUsers, FaCrown, FaCode, FaPlus, FaTrash } from 'react-icons/fa';
import { usePermissions } from '../hooks/usePermissions';

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
      const response = await fetch('/api/admin/users-with-roles', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const assignRole = async (userId: string, roleName: string) => {
    try {
      const response = await fetch('/api/admin/assign-role', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, roleName }),
      });

      if (response.ok) {
        fetchUsers();
        setShowAssignModal(false);
      }
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  const removeRole = async (userId: string, roleName: string) => {
    try {
      const response = await fetch('/api/admin/remove-role', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, roleName }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error removing role:', error);
    }
  };

  if (!isDeveloper()) {
    return <div>Access denied. Developer role required.</div>;
  }

  if (loading) {
    return <div>Loading role management...</div>;
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
    </div>
  );
};

export default RoleManagement;
