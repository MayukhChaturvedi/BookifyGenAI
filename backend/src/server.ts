import { createHttpTerminator } from 'http-terminator';
import app from './app.js';
import config from './config/config.js';
import pool from './db/chatPool.js';
import sql from './db/db.js';

process.on('unhandledRejection', (reason, promise) => {
  console.error(
    'CRITICAL: Unhandled Rejection at:',
    promise,
    'reason:',
    reason,
  );
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('CRITICAL: Uncaught Exception:', error);
  process.exit(1);
});

const server = app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

const httpTerminator = createHttpTerminator({
  server,
});

const gracefulShutdown = () => {
  console.log('🔹 Received shutdown signal. Forcing shutdown...');

  httpTerminator
    .terminate()
    .then(() => {
      console.log('✅ HTTP server terminated.');
    })
    .catch((error) => {
      console.error('⚠️  Error terminating HTTP server:', error);
    })
    .finally(async () => {
      console.log('   Sending close command to database pools...');
      try {
        await Promise.all([
          sql.end({ timeout: 1 }), // Very short timeout
          pool.end(),
        ]);
        console.log('✅ Database pool close commands sent.');
      } catch (dbError) {
        console.error(
          '⚠️  Error sending close command to database pools:',
          dbError,
        );
      }
      console.log('🎉 Forcing process exit.');
      process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown); // For cloud services like Render/Docker
process.on('SIGINT', gracefulShutdown); // For Ctrl+C in your terminal
