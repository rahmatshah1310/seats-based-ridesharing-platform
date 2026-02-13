export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message); // sets this.message
    this.statusCode = statusCode; // HTTP status code, e.g., 400
    this.isOperational = true; // mark it as "expected" error

    Error.captureStackTrace(this, this.constructor); // keeps stack trace clean
  }
}
