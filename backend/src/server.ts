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
import app from './app.js';
import config from './config/config.js';
import pool from './db/chatPool.js';
import sql from './db/db.js';

const server = app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

const gracefulShutdown = () => {
  console.log('🔹 Received shutdown signal, closing connections...');

  server.close(async () => {
    console.log('   Closed out remaining HTTP connections.');

    try {
      // Use Promise.all to close connections concurrently
      await Promise.all([
        sql.end({ timeout: 5 }), // Close the porsager/postgres connection
        pool.end(), // Close the node-postgres pool
      ]);
      console.log('✅ Successfully closed database connections.');
      process.exit(0); // Exit with success code
    } catch (error) {
      console.error('❌ Error during database connection shutdown:', error);
      process.exit(1); // Exit with failure code
    }
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
