'use strict';
// Define and export the AppError class and ErrorType enum
Object.defineProperty(exports, '__esModule', { value: true });
exports.AppError = exports.ErrorType = void 0;
// Enum for error types
var ErrorType;
(function (ErrorType) {
  ErrorType['VALIDATION'] = 'VALIDATION';
  ErrorType['SERVER_ERROR'] = 'SERVER_ERROR';
  ErrorType['AUTHENTICATION'] = 'AUTHENTICATION';
  ErrorType['NOT_FOUND'] = 'NOT_FOUND';
})(ErrorType || (exports.ErrorType = ErrorType = {}));
// Custom error class for application-specific errors
class AppError extends Error {
  constructor(message, statusCode, type) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
exports.AppError = AppError;
