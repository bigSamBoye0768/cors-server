import AppError from "./base.error";

export class NotFoundException extends AppError {
    statusCode: number;
    message: string;

    constructor(message: string) {
        super(message);
        this.statusCode = 404; // Not Found
        this.message = message || "Resource not found";
        Object.setPrototypeOf(this, NotFoundException.prototype);
        this.name = "NotFoundException";
    }
}
