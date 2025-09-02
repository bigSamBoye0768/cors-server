import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../utils/errors";

export function notFound() {
	return (req: Request, _res: Response, next: NextFunction) => {
		next(new NotFoundError(`No route matches ${req.method} ${req.originalUrl}`));
	};
}
