/**
 * cPanel / production entry point.
 * Run with: node app.js (from the backend directory).
 * Builds the project if dist/ is missing, then starts the app.
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distIndex = join(__dirname, 'dist', 'index.js');

if (!existsSync(distIndex)) {
  console.log('dist/ not found. Running npm run build...');
  execSync('npm run build', { cwd: __dirname, stdio: 'inherit' });
}

await import(pathToFileURL(distIndex).href);
