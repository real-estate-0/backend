import { ERROR_CODE } from "./errorCode";

class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public stack: string;
  public errorResponse: TERROR_RESPONSE;

  constructor(
    statusCode: number,
    error: string,
    isOperational = true,
    stack = ""
  ) {
    super(error);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    console.log("ApiError", error);
    if (error) {
      if (ERROR_CODE.hasOwnProperty(error)) {
        this.errorResponse = ERROR_CODE[error];
      } else {
        this.errorResponse = ERROR_CODE["UNKNOWN"];
      }
    }

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
