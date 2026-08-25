/**
 * cPanel / production entry point.
 * Run with: node app.js (from the backend directory).
 * Starts the compiled project from dist/.
 */
import { existsSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distIndex = join(__dirname, 'dist', 'index.js');

if (!existsSync(distIndex)) {
  console.error('dist/index.js not found. Build the backend with "npm run build" and deploy the dist/ directory.');
  process.exit(1);
}

// No top-level await: lsnode/cPanel loads this with require(), which cannot handle async ESM
import(pathToFileURL(distIndex).href).catch((err) => {
  console.error(err);
  process.exit(1);
});
