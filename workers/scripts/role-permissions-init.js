import { neon } from '@neondatabase/serverless';

export class RolePermissions {
  constructor(databaseUrl) {
    this.sql = neon(databaseUrl);
  }

  // Initialize roles and permissions
  async initializeRolesAndPermissions() {
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
        VALUES (${role.name}, ${role.display_name}, ${role.description}, ${role.permissions})
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
}
