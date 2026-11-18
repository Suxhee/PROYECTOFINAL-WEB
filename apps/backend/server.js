import app from './src/app.js';
import { env } from './src/config/env.js';
import { sequelize } from './src/models/index.js';

try {
  await sequelize.authenticate();
  const server = app.listen(env.PORT, () => {
    console.info(`API listening on port ${env.PORT}`);
  });

  const shutdown = (signal) => {
    console.info(`${signal} received; shutting down.`);
    server.close(async (error) => {
      await sequelize.close();
      if (error) {
        console.error('HTTP server shutdown failed.', error);
        process.exitCode = 1;
      }
    });
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
} catch (error) {
  console.error('Backend startup failed.', error);
  process.exitCode = 1;
}
