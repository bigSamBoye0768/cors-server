import { NextFunction, Request, Response } from "express";
import asyncHandler from "../../utils/async-handler";
import { AuthService } from "./auth.service";

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    public login = asyncHandler(async (_req: Request, _res: Response, _next: NextFunction) => {});
    public register = asyncHandler(async (_req: Request, _res: Response, _next: NextFunction) => {});
}
