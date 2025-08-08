import { NextFunction, Request, Response } from "express";
import asyncHandler from "../../utils/async-handler";
import { AuthService } from "./auth.service";
import { StatusCodes } from "http-status-codes";
import { registerSchema } from "../../validators/auth.validator";

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    public login = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
        return res.status(StatusCodes.OK).json({
            message: "Login successful",
        });
    });
    public register = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
        const userAgent = req.headers["user-agent"];
        const ipAddress = req.ip;

        const body = registerSchema.parse({
            ...req.body,
            userAgent: userAgent || "Unknown User Agent",
            ipAddress,
        });

        this.authService.register(body);
        return res.status(StatusCodes.CREATED).json({
            message: "User registered successfully",
        });
    });
}
