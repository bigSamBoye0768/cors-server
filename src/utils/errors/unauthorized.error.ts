import AppError from "./base.error";

export class UnauthorizedException extends AppError {
    statusCode: number;
    message: string;

    constructor(message: string) {
        super(message);
        this.statusCode = 401; // Unauthorized
        this.message = message || "Unauthorized";
        Object.setPrototypeOf(this, UnauthorizedException.prototype);
        this.name = "UnauthorizedException";
    }
}
