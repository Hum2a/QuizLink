import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createFirstAdmin() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  try {
    console.log('🔧 Setting up first admin/developer user...');

    // Get user input for admin details
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = prompt =>
      new Promise(resolve => rl.question(prompt, resolve));

    console.log('\n📝 Please provide details for the first admin user:');

    const email = await question('Email address: ');
    const username = await question('Username: ');
    const displayName = await question('Display name: ');
    const password = await question('Password: ');
    const role =
      (await question('Role (admin/developer) [developer]: ')) || 'developer';

    rl.close();

    if (!email || !username || !displayName || !password) {
      console.error('❌ All fields are required!');
      process.exit(1);
    }

    // Hash the password (simple hash for now - you might want to use bcrypt in production)
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM user_accounts WHERE email = ${email} OR username = ${username}
    `;

    if (existingUser.length > 0) {
      console.log('⚠️  User already exists! Assigning admin role...');

      const userId = existingUser[0].id;

      // Get the role ID
      const roleResult = await sql`
        SELECT id FROM roles WHERE name = ${role}
      `;

      if (roleResult.length === 0) {
        console.error(`❌ Role '${role}' not found!`);
        process.exit(1);
      }

      const roleId = roleResult[0].id;

      // Assign the role
      await sql`
        INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
        VALUES (${userId}, ${roleId}, ${userId}, NOW())
        ON CONFLICT (user_id, role_id) DO UPDATE SET
          assigned_at = NOW()
      `;

      console.log(`✅ Role '${role}' assigned to existing user!`);
    } else {
      // Create new user
      const userResult = await sql`
        INSERT INTO user_accounts (email, username, display_name, password_hash, created_at)
        VALUES (${email}, ${username}, ${displayName}, ${hashedPassword}, NOW())
        RETURNING id
      `;

      const userId = userResult[0].id;

      // Get the role ID
      const roleResult = await sql`
        SELECT id FROM roles WHERE name = ${role}
      `;

      if (roleResult.length === 0) {
        console.error(`❌ Role '${role}' not found!`);
        process.exit(1);
      }

      const roleId = roleResult[0].id;

      // Assign the role
      await sql`
        INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
        VALUES (${userId}, ${roleId}, ${userId}, NOW())
      `;

      console.log(`✅ User created and '${role}' role assigned!`);
    }

    // Show the user's permissions
    const permissions = await sql`
      SELECT p.name, p.description
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = (
        SELECT id FROM user_accounts WHERE email = ${email}
      )
      ORDER BY p.name
    `;

    console.log('\n🎯 User permissions:');
    permissions.forEach(perm => {
      console.log(`  • ${perm.name}: ${perm.description}`);
    });

    console.log('\n🎉 First admin/developer user setup complete!');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Username: ${username}`);
    console.log(`🎭 Role: ${role}`);
    console.log(`🔑 Password: [hidden]`);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

createFirstAdmin();
