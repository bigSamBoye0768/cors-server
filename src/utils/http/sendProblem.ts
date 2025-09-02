import type { Response } from "express";
import type { Problem } from "./problem";

export function sendProblem(res: Response, problem: Problem) {
	// Never cache errors
	res.setHeader("Cache-Control", "no-store");

	// Extra security headers
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("Content-Security-Policy", "default-src 'none'");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("Content-Type", "application/problem+json; charset=utf-8");
	return res.status(problem.status).json(problem);
}
