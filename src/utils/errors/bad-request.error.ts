import AppError from "./base.error";

export class BadRequestException extends AppError {
    statusCode: number;
    message: string;

    constructor(message: string) {
        super(message);
        this.statusCode = 400; // Bad Request
        this.message = message || "Bad Request";
        Object.setPrototypeOf(this, BadRequestException.prototype);
        this.name = "BadRequestException";
    }
}
