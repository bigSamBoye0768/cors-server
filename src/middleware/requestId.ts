import { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

/**
 * Ensures every request has a request ID for correlation.
 * Echoes it back in the response header.
 */
export function requestId() {
	return (req: Request, res: Response, next: NextFunction) => {
		const inbound = (req.headers["x-request-id"] as string | undefined) ?? undefined;
		const id = inbound ?? `req_${randomUUID()}`;
		// Expose to downstream handlers
		(req as any).requestId = id;
		res.setHeader("X-Request-Id", id);
		next();
	};
}
