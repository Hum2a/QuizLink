import { neon } from '@neondatabase/serverless';

export interface Role {
  id: string;
  name: 'developer' | 'admin';
  display_name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by: string;
  assigned_at: string;
  expires_at?: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export class RolePermissions {
  private sql: ReturnType<typeof neon>;

  constructor(databaseUrl: string) {
    this.sql = neon(databaseUrl);
  }

  // Initialize roles and permissions
  async initializeRolesAndPermissions(): Promise<void> {
    // Create permissions
    const permissions = [
      {
        name: 'view_analytics',
        resource: 'analytics',
        action: 'read',
        description: 'View analytics and statistics',
      },
      {
        name: 'manage_users',
        resource: 'users',
        action: 'write',
        description: 'Manage user accounts and roles',
      },
      {
        name: 'view_logs',
        resource: 'logs',
        action: 'read',
        description: 'View system logs and debugging information',
      },
      {
        name: 'manage_quizzes',
        resource: 'quizzes',
        action: 'write',
        description: 'Create, edit, and delete quiz templates',
      },
      {
        name: 'view_system_health',
        resource: 'system',
        action: 'read',
        description: 'View system health and performance metrics',
      },
      {
        name: 'manage_roles',
        resource: 'roles',
        action: 'write',
        description: 'Assign and manage user roles',
      },
    ];

    // Insert permissions
    for (const permission of permissions) {
      await this.sql`
        INSERT INTO permissions (name, resource, action, description)
        VALUES (${permission.name}, ${permission.resource}, ${permission.action}, ${permission.description})
        ON CONFLICT (name) DO NOTHING
      `;
    }

    // Create roles
    const roles = [
      {
        name: 'developer',
        display_name: 'Developer',
        description:
          'Full access to all features including debugging and analytics',
        permissions: [
          'view_analytics',
          'manage_users',
          'view_logs',
          'manage_quizzes',
          'view_system_health',
          'manage_roles',
        ],
      },
      {
        name: 'admin',
        display_name: 'Admin',
        description: 'Administrative access to manage users and content',
        permissions: [
          'view_analytics',
          'manage_users',
          'manage_quizzes',
          'manage_roles',
        ],
      },
    ];

    // Insert roles
    for (const role of roles) {
      const roleResult = await this.sql`
        INSERT INTO roles (name, display_name, description, permissions)
        VALUES (${role.name}, ${role.display_name}, ${
        role.description
      }, ${JSON.stringify(role.permissions)})
        ON CONFLICT (name) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          description = EXCLUDED.description,
          permissions = EXCLUDED.permissions,
          updated_at = NOW()
        RETURNING id
      `;

      const roleId = roleResult[0].id;

      // Assign permissions to role
      for (const permissionName of role.permissions) {
        await this.sql`
          INSERT INTO role_permissions (role_id, permission_id)
          SELECT ${roleId}, p.id
          FROM permissions p
          WHERE p.name = ${permissionName}
          ON CONFLICT DO NOTHING
        `;
      }
    }
  }

  // Get user roles
  async getUserRoles(userId: string): Promise<Role[]> {
    const result = await this.sql`
      SELECT r.id, r.name, r.display_name, r.description, r.permissions, r.created_at, r.updated_at
      FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ${userId}
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      ORDER BY r.name
    `;

    return result as Role[];
  }

  // Check if user has permission
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const result = await this.sql`
      SELECT 1
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ${userId}
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        AND r.permissions @> ${JSON.stringify([permission])}
      LIMIT 1
    `;

    return (result as any[]).length > 0;
  }

  // Check if user has any of the specified roles
  async hasRole(userId: string, roles: string[]): Promise<boolean> {
    const result = await this.sql`
      SELECT 1
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ${userId}
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        AND r.name = ANY(${roles})
      LIMIT 1
    `;

    return (result as any[]).length > 0;
  }

  // Assign role to user
  async assignRole(
    userId: string,
    roleName: string,
    assignedBy: string,
    expiresAt?: Date
  ): Promise<void> {
    const role = await this.sql`
      SELECT id FROM roles WHERE name = ${roleName}
    `;

    if ((role as any[]).length === 0) {
      throw new Error(`Role ${roleName} not found`);
    }

    await this.sql`
      INSERT INTO user_roles (user_id, role_id, assigned_by, expires_at)
      VALUES (${userId}, ${(role as any[])[0].id}, ${assignedBy}, ${
      expiresAt || null
    })
      ON CONFLICT (user_id, role_id) DO UPDATE SET
        assigned_by = EXCLUDED.assigned_by,
        expires_at = EXCLUDED.expires_at,
        assigned_at = NOW()
    `;
  }

  // Remove role from user
  async removeRole(userId: string, roleName: string): Promise<void> {
    await this.sql`
      DELETE FROM user_roles ur
      USING roles r
      WHERE ur.role_id = r.id
        AND ur.user_id = ${userId}
        AND r.name = ${roleName}
    `;
  }

  // Get all users with their roles
  async getUsersWithRoles(): Promise<any[]> {
    const result = await this.sql`
      SELECT
        ua.id,
        ua.email,
        ua.username,
        ua.display_name,
        ua.created_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', r.id,
              'name', r.name,
              'display_name', r.display_name,
              'assigned_at', ur.assigned_at,
              'expires_at', ur.expires_at
            )
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'::json
        ) as roles
      FROM user_accounts ua
      LEFT JOIN user_roles ur ON ua.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY ua.id, ua.email, ua.username, ua.display_name, ua.created_at
      ORDER BY ua.display_name
    `;

    return result as any[];
  }

  // Get all roles
  async getAllRoles(): Promise<Role[]> {
    const result = await this.sql`
      SELECT id, name, display_name, description, permissions, created_at, updated_at
      FROM roles
      ORDER BY name
    `;

    return result as Role[];
  }

  // Get all permissions
  async getAllPermissions(): Promise<Permission[]> {
    const result = await this.sql`
      SELECT id, name, resource, action, description
      FROM permissions
      ORDER BY resource, action
    `;

    return result as Permission[];
  }
}
