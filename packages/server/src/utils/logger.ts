import pino from 'pino';

// Configure log level based on environment
const logLevel =
  process.env.LOG_LEVEL ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Create a logger instance
const logger = pino({
  level: logLevel,
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  formatters: {
    level: label => {
      return { level: label };
    },
  },
  base: undefined, // Removes pid and hostname from logs
});

// Export the logger instance
export default logger;

// Export convenience wrappers for common log levels
export const info = logger.info.bind(logger);
export const error = logger.error.bind(logger);
export const warn = logger.warn.bind(logger);
export const debug = logger.debug.bind(logger);
export const trace = logger.trace.bind(logger);
export const fatal = logger.fatal.bind(logger);
