export enum ErrorType {
  VALIDATION = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  SERVER_ERROR = "SERVER_ERROR",
  CONFLICT = "CONFLICT",
}

export class AppError extends Error {
  statusCode: number;
  type: ErrorType;

  constructor(message: string, statusCode: number, type: ErrorType) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.name = this.constructor.name;
  }

  static notFound(message: string) {
    return new AppError(message, 404, ErrorType.NOT_FOUND);
  }

  static validation(message: string) {
    return new AppError(message, 400, ErrorType.VALIDATION);
  }

  static unauthorized(message: string) {
    return new AppError(message, 401, ErrorType.UNAUTHORIZED);
  }

  static forbidden(message: string) {
    return new AppError(message, 403, ErrorType.FORBIDDEN);
  }

  static serverError(message: string) {
    return new AppError(message, 500, ErrorType.SERVER_ERROR);
  }

  static conflict(message: string) {
    return new AppError(message, 409, ErrorType.CONFLICT);
  }
}

export const catchAsync = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    fn(req, res, next).catch(next);
  };
};
