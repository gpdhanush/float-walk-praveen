import { pool } from './pool.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  const statements = schema
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  for (const stmt of statements) {
    if (stmt) await pool.execute(stmt + ';');
  }
  console.log('Migrations completed.');
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error(err);
  process.exit(1);
});
