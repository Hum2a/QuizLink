import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  try {
    console.log('Starting database migrations...');

    // Read and execute the role permissions migration
    const migrationPath = join(
      __dirname,
      '..',
      'migrations',
      '001_create_role_permissions.sql'
    );
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('Running migration: 001_create_role_permissions.sql');

    // Split SQL into individual statements, handling multi-line statements properly
    const statements = [];
    let currentStatement = '';
    let inBlock = false;
    let blockDelimiter = '';

    const lines = migrationSQL.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('--')) {
        continue;
      }

      currentStatement += line + '\n';

      // Check if we're starting a block (function, DO block, etc.)
      if (!inBlock) {
        if (
          trimmedLine.includes('CREATE OR REPLACE FUNCTION') ||
          trimmedLine.includes('CREATE FUNCTION')
        ) {
          inBlock = true;
          blockDelimiter = '$$';
        } else if (trimmedLine.includes('DO $$')) {
          inBlock = true;
          blockDelimiter = '$$';
        }
      }

      // Check if we're ending a block - look for $$ followed by language or semicolon
      if (inBlock && trimmedLine.includes(blockDelimiter)) {
        // Check if this line contains the end of the function/block
        if (
          trimmedLine.includes('$$ language') ||
          trimmedLine.includes('$$;') ||
          (trimmedLine.includes('$$') && trimmedLine.includes(';'))
        ) {
          inBlock = false;
          blockDelimiter = '';
        }
      }

      // If we're not in a block and we hit a semicolon, it's the end of a statement
      if (!inBlock && trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }

    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(
          `Executing statement ${i + 1}/${
            statements.length
          }: ${statement.substring(0, 50)}...`
        );
        await sql.query(statement);
      }
    }

    console.log('✅ Migration completed successfully!');

    // Initialize roles and permissions
    console.log('Initializing roles and permissions...');
    const { RolePermissions } = await import('./role-permissions-init.js');
    const rolePermissions = new RolePermissions(databaseUrl);
    await rolePermissions.initializeRolesAndPermissions();

    console.log('✅ Roles and permissions initialized!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
