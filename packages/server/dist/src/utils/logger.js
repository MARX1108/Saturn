'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.fatal =
  exports.trace =
  exports.debug =
  exports.warn =
  exports.error =
  exports.info =
    void 0;
const pino_1 = __importDefault(require('pino'));
// Configure log level based on environment
const logLevel =
  process.env.LOG_LEVEL ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
// Create a logger instance
const logger = (0, pino_1.default)({
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
exports.default = logger;
// Export convenience wrappers for common log levels
exports.info = logger.info.bind(logger);
exports.error = logger.error.bind(logger);
exports.warn = logger.warn.bind(logger);
exports.debug = logger.debug.bind(logger);
exports.trace = logger.trace.bind(logger);
exports.fatal = logger.fatal.bind(logger);
