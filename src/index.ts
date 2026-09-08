import { config } from './config';
import { createApp } from './app';
import { initializeFirebase } from './config/firebase';
import { logger } from './utils/logger';

/**
 * Application entry point.
 * Initializes services and starts the Express server.
 */
async function main(): Promise<void> {
  try {
    // Initialize Firebase Admin SDK
    if (config.firebase.projectId) {
      initializeFirebase();
    } else {
      logger.warn('Firebase project ID not set — auth middleware will fail');
    }

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`🏠 Rental Home API server running on port ${config.port}`);
      logger.info(`   Environment: ${config.nodeEnv}`);
      logger.info(`   Health check: http://localhost:${config.port}/health`);
      logger.info(`   API base: http://localhost:${config.port}/api/v1`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });

      // Force close after 10s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Unhandled rejection handler
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

main();
