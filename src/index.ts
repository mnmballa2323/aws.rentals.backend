import { config } from './config';
import { createApp } from './app';
import { logger } from './utils/logger';

/**
 * Application entry point.
 * Initializes AWS services and starts the Express server.
 */
async function main(): Promise<void> {
  try {
    if (config.aws.cognitoUserPoolId) {
      logger.info(`AWS Cognito Auth configured for User Pool: ${config.aws.cognitoUserPoolId}`);
    } else {
      logger.info('AWS Cognito User Pool not set — running with local development mock auth');
    }

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`🏠 AWS Rentals API Server running on port ${config.port} (AWS Infrastructure)`);
      logger.info(`   AWS Region: ${config.aws.region}`);
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
