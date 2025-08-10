import { StatusCodes } from "http-status-codes";
import { ErrorCode } from "./error-codes";

class AppError extends Error {
    public statusCode: StatusCodes;
    public isOperational: boolean;
    public stack?: string;
    public errorCode?: ErrorCode | undefined;
    public details?: any;

    constructor(
        message: string,
        statusCode: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR,
        isOperational = true,
        errorCode?: ErrorCode,
        details?: any
    ) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errorCode = errorCode || undefined;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export default AppError;
