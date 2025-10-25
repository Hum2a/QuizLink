import { neon } from '@neondatabase/serverless';
import { readFileSync, readdirSync } from 'fs';
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

    // Get all migration files
    const migrationsDir = join(__dirname, '..', 'migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(
      `Found ${migrationFiles.length} migration files:`,
      migrationFiles
    );

    for (const migrationFile of migrationFiles) {
      console.log(`Running migration: ${migrationFile}`);

      const migrationPath = join(migrationsDir, migrationFile);
      const migrationSQL = readFileSync(migrationPath, 'utf8');

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

        // Handle dollar-quoted strings (PostgreSQL)
        if (trimmedLine.includes('$$')) {
          if (!inBlock) {
            // Starting a block
            const dollarMatch = trimmedLine.match(/\$\$([^$]*)\$\$/);
            if (dollarMatch) {
              // Single-line dollar quote
              continue;
            } else {
              // Multi-line dollar quote
              inBlock = true;
              blockDelimiter = trimmedLine.match(/\$\$[^$]*\$\$/)?.[0] || '$$';
            }
          } else {
            // Check if this line ends the block
            if (trimmedLine.includes(blockDelimiter)) {
              inBlock = false;
              blockDelimiter = '';
            }
          }
        }

        // If we're not in a block and the line ends with semicolon, it's a complete statement
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

      // Execute each statement
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement) {
          console.log(
            `Executing statement ${i + 1}/${
              statements.length
            }: ${statement.substring(0, 50)}...`
          );
          try {
            await sql.query(statement);
          } catch (error) {
            console.error(`Error executing statement ${i + 1}:`, error.message);
            console.error('Statement:', statement);
            throw error;
          }
        }
      }

      console.log(`✅ Migration ${migrationFile} completed successfully!`);
    }

    console.log('✅ All migrations completed successfully!');

    // Initialize roles and permissions
    console.log('Initializing roles and permissions...');
    const { RolePermissions } = await import('./role-permissions-init.js');
    const rolePermissions = new RolePermissions(databaseUrl);
    await rolePermissions.initializeRolesAndPermissions();
    console.log('✅ Roles and permissions initialized!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
