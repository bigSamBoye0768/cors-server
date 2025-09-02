import { NextFunction, Request, Response } from "express";
import asyncHandler from "../../../utils/async-handler";
import { StatusCodes } from "http-status-codes";
import { registerSchema } from "../../../validators/auth.validator";
import { EmailPasswordService } from "./email.service";

export class EmailPasswordController {
	constructor(private readonly authService: EmailPasswordService) {}

	public login = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
		return res.status(StatusCodes.OK).json({
			message: "Login successful",
		});
	});

	public register = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<any> => {
		const userAgent = req.headers["user-agent"];
		const ipAddress = req.ip;

		console.log(req.body);

		const body = registerSchema.parse({
			...req.body,
		});

		console.log("register user body", body);

		const data = await this.authService.register(body);

		return res.status(StatusCodes.CREATED).json({
			message: "User registered successfully",
			data,
		});
	});
}
