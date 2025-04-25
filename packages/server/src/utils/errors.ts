// Define and export the AppError class and ErrorType enum

// Enum for error types
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  SERVER_ERROR = 'SERVER_ERROR',
  AUTHENTICATION = 'AUTHENTICATION',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
}

// Custom error class for application-specific errors
export class AppError extends Error {
  public statusCode: number;
  public type: ErrorType;

  constructor(message: string, statusCode: number, type: ErrorType) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;

    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
