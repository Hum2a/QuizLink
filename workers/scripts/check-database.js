import { neon } from '@neondatabase/serverless';

async function checkDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  try {
    console.log('🔍 Checking user accounts...');
    const users =
      await sql`SELECT id, email, username, display_name FROM user_accounts`;
    console.log('Users:', users);

    console.log('\n🔍 Checking user roles...');
    const userRoles = await sql`
      SELECT
        ua.email,
        ua.username,
        r.name as role_name,
        r.display_name as role_display_name,
        ur.assigned_at
      FROM user_accounts ua
      LEFT JOIN user_roles ur ON ua.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ORDER BY ua.email
    `;
    console.log('User Roles:', userRoles);

    console.log('\n🔍 Checking roles table...');
    const roles = await sql`SELECT id, name, display_name FROM roles`;
    console.log('Roles:', roles);
  } catch (error) {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  }
}

checkDatabase();
