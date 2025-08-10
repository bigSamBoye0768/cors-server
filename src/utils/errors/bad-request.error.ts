import { StatusCodes } from "http-status-codes";
import AppError from "./base.error";
import { ErrorCode } from "./error-codes";

export class BadRequestException extends AppError {
    constructor(message: string, errorCode?: ErrorCode, details?: any) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = StatusCodes.BAD_REQUEST; // Bad Request
        this.message = message || "Bad Request";
        this.details = details;
        Object.setPrototypeOf(this, BadRequestException.prototype);
        this.name = "BadRequestException";
    }
}
