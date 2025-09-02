import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { VaultErrorCode } from "../utils/errors/error-codes";
import { ValidationError, VaultError } from "../utils/errors";
import { sendProblem } from "../utils/http/sendProblem";

export type ErrorHandlerOptions = {
	env?: "development" | "production" | "test";
	/** If true (default in dev), include stack/cause in `debug` */
	includeStack?: boolean;
	/** How many `.cause` levels to include in debug (0 = none) */
	includeCauses?: number;
	/** Max lines of stack to include */
	maxStackLines?: number;
	/** Header name to force debug if value is "1" and requester is allowed */
	allowDebugHeader?: string; // e.g., "x-vault-debug"
	/** IPs/CIDRs that are allowed to see debug when header present (or always in dev) */
	showDebugForIPs?: string[]; // e.g., ["127.0.0.1", "::1"]
	/** Force-disable debug even in dev */
	disableDebug?: boolean;
};

/**
 * Centralized RFC 7807 error responder.
 * - Maps Zod validation to 422 with invalid_params.
 * - Sanitizes unknown errors to a safe 500.
 * - Adds auth and rate-limit headers when appropriate.
 */

function requestId(req: Request, res: Response): string {
	return ((req as any).requestId as string) ?? (req.headers["X-Request-Id"] as string) ?? undefined;
}

function isAllowedIP(req: Request, allow: string[] | undefined) {
	if (!allow || allow.length === 0) return true; // permissive by default for dev-only usage
	const ip = (req.ip || req.socket.remoteAddress || "").toString();
	return allow.includes(ip);
}

function trimStack(stack: string | undefined, maxLines?: number): string | undefined {
	if (!stack) return undefined;
	if (!maxLines || maxLines <= 0) return stack;
	return stack.split("\n").slice(0, maxLines).join("\n");
}

/**
 * Decides if we should attach a debug block to the JSON response
 * - In dev: allowed unless disabled or IP not allowed.
 * - In prod/test: require a specific header (e.g. x-vault-debug: 1) and allowed IP.
 */
function shouldShowDebug(
	req: Request,
	opts: Required<Pick<ErrorHandlerOptions, "env" | "allowDebugHeader" | "showDebugForIPs" | "includeStack">> &
		Pick<ErrorHandlerOptions, "disableDebug">
) {
	if (opts.disableDebug) return false;
	if (opts.env === "development") return isAllowedIP(req, opts.showDebugForIPs);
	// In production/test: require explicit header + IP allow
	const hdr = opts.allowDebugHeader?.toLowerCase();
	const wants = hdr ? req.headers[hdr] === "1" || req.headers[hdr] === "true" : false;
	return wants && isAllowedIP(req, opts.showDebugForIPs);
}

function collectCauses(err: any, depth: number): string[] {
	const causes: string[] = [];
	let current = err;
	let count = 0;

	while (current?.cause && count < depth) {
		const msg = current.cause?.message ?? String(current.cause);
		causes.push(msg);
		current = current.cause;
		count++;
	}

	return causes;
}

export function errorHandler(options: ErrorHandlerOptions = {}) {
	const {
		env = (process.env.NODE_ENV as "development" | "production" | "test") ?? "development",
		includeStack = env != "production",
		includeCauses,
		allowDebugHeader = "x-vault-debug",
		showDebugForIPs = ["127.0.0.1", "::1"],
		disableDebug = false,
		maxStackLines = process.env.NODE_ENV === "development" ? undefined : 15,
	} = options;
	return (err: unknown, req: Request, res: Response, _next: NextFunction) => {
		console.error("Error occurred:", err);

		const reqId = requestId(req, res);
		const instance = reqId ? `${req.originalUrl}#${reqId}` : req.originalUrl;

		// Map Zod -> 422
		if (err instanceof ZodError) {
			const invalid = err.issues.map((i) => ({
				name: i.path.join("."),
				reason: i.message,
				code: i.code,
			}));
			err = new ValidationError(invalid);
		}

		let status = StatusCodes.INTERNAL_SERVER_ERROR;
		let body: any = {
			type: "https://docs.vault.dev/errors/server#internal",
			title: ReasonPhrases.INTERNAL_SERVER_ERROR,
			status,
			detail: "Something went wrong",
			instance,
			code: VaultErrorCode.SERVER_ERROR,
			request_id: reqId,
			retryable: true,
			docs: "https://status.vault.dev/incidents",
		};

		if (err instanceof VaultError) {
			status = err.status;
			body = err.toProblem(instance, reqId);

			// 401 header
			if (status === 401 && !res.getHeader("WWW-Authenticate")) {
				res.setHeader("WWW-Authenticate", 'Bearer realm="vault", error="invalid_token"');
			}

			// // 429 headers
			// if (err instanceof RateLimitError) {
			// 	if (err.retryAfter != null) res.setHeader("Retry-After", String(err.retryAfter));
			// 	if (err.limit != null) res.setHeader("RateLimit-Limit", String(err.limit));
			// 	if (err.remaining != null) res.setHeader("RateLimit-Remaining", String(err.remaining));
			// 	if (err.reset != null) res.setHeader("RateLimit-Reset", String(err.reset));
			// }
		}

		const showDebug = shouldShowDebug(req, { env, allowDebugHeader, showDebugForIPs, includeStack, disableDebug });

		// Attach dev-only debug without changing the public contract
		if (showDebug) {
			const anyErr = err as any;

			body.debug = {
				env,
				error_name: anyErr.name ?? undefined,
				stack: includeStack ? trimStack(anyErr?.stack, maxStackLines) : undefined,
				causes: includeCauses ? collectCauses(anyErr, includeCauses) : undefined,
				// Handy hints that never include user PII:
				hint: "You are seeing this because debug is enabled. Disable in production.",
				route: { method: req.method, path: req.route?.path ?? req.path },
				ts: new Date().toISOString(),
			};
		}

		return sendProblem(res, body);
	};
}

// Production
// {
//     "type": "https://docs.vault.dev/errors/server#internal",
//     "title": "Internal server error",
//     "status": 500,
//     "detail": "Something went wrong on our side.",
//     "instance": "/v1/sessions",
//     "code": "VAULT.SERVER.ERROR",
//     "request_id": "req_01J…",
//     "retryable": true,
//     "docs": "https://status.vault.dev/incidents"
//   }

// Development
// {
//     "type": "https://docs.vault.dev/errors/request#validation",
//     "title": "Invalid request parameters",
//     "status": 422,
//     "detail": "Some fields failed validation.",
//     "instance": "/v1/users",
//     "code": "VAULT.REQUEST.VALIDATION_FAILED",
//     "request_id": "req_01J…",
//     "invalid_params": [
//       { "name": "email", "reason": "Must be a valid email address.", "code": "format_email" }
//     ],
//     "retryable": false,
//     "docs": "https://docs.vault.dev/requests#validation",
//     "debug": {
//       "env": "development",
//       "error_name": "ValidationError",
//       "message": "Invalid request parameters",
//       "stack": "ValidationError: Invalid request parameters\n    at ...",
//       "causes": [
//         { "name": "ZodError", "message": "Invalid email", "stack": "ZodError: Invalid email\n    at ..." }
//       ],
//       "hint": "You are seeing this because debug is enabled. Disable in production.",
//       "route": { "method": "POST", "path": "/v1/users" },
//       "ts": "2025-08-15T10:12:33Z"
//     }
//   }
