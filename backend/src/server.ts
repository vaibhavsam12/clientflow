import { app } from './app';
import { config } from './config';
import { prisma } from './prisma';
import { logger } from './utils/logger';

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`ClientFlow Backend API running in [${config.nodeEnv}] on port ${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}/api/health`);
});

const handleShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Database connection disconnected.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if lingering
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
