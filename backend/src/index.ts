import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { mkdir } from 'fs/promises';
import { googleReviewSyncJob } from './container.js';

async function main() {
  await mkdir('logs', { recursive: true }).catch(() => {});

  const app = createApp();

  app.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port} (${config.env})`);
    logger.info(`API docs: ${config.apiBaseUrl || `:${config.port}`}/api-docs`);
    googleReviewSyncJob.start();
  });
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
