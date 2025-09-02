// RFC 7807 Problem Details + Vault extensions

import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { VaultErrorCode } from "./errors/error-codes";
import { InvalidParam, Problem } from "./http/problem";

interface VaultErrorOpts {
	title: string;
	status: StatusCodes;
	code: VaultErrorCode;
	invalidParams?: InvalidParam[];
	retryable?: boolean;
	docs?: string;
	type: string;
	detail?: string;
	meta?: Record<string, unknown>;
}

export class VaultError extends Error {
	public status: StatusCodes;
	public code: VaultErrorCode;
	public invalidParams?: InvalidParam[] | undefined;
	public retryable: boolean | undefined;
	public docs?: string | undefined;
	public type: string;
	public detail?: string | undefined;
	public meta?: Record<string, unknown> | undefined;

	constructor(opts: VaultErrorOpts) {
		super(opts.title);
		this.name = "VaultError";
		this.status = opts.status;
		this.code = opts.code;
		this.docs = opts.docs;
		this.invalidParams = opts.invalidParams;
		this.retryable = opts.retryable;
		this.meta = opts.meta;
		this.type = opts.type;
		this.detail = opts.detail;
		Error.captureStackTrace(this, this.constructor);
		Object.setPrototypeOf(this, VaultError.prototype);
		this.name = "VaultError";
	}

	toProblem(instance: string, requestId?: string): Problem {
		return {
			type: this.type,
			title: this.message,
			status: this.status,
			detail: this.detail ?? this.message,
			instance,
			code: this.code,
			request_id: requestId,
			retryable: this.retryable,
			docs: this.docs,
			invalid_params: this.invalidParams,
			meta: this.meta,
		};
	}
}

export class NotFoundError extends VaultError {
	constructor(detail = "The requested resource was not found.") {
		super({
			status: 404,
			code: VaultErrorCode.RESOURCE_NOT_FOUND,
			title: ReasonPhrases.NOT_FOUND,
			detail,
			type: "https://docs.vault.dev/errors/not-found",
			retryable: false,
		});
	}
}

export class ValidationError extends VaultError {
	constructor(invalidParams: InvalidParam[], detail = "Some fields failed validation.") {
		super({
			status: 422,
			code: VaultErrorCode.REQUEST_VALIDATION_FAILED,
			title: ReasonPhrases.UNPROCESSABLE_ENTITY,
			detail,
			type: "https://docs.vault.dev/errors/request#validation",
			retryable: false,
			invalidParams,
		});
	}
}

export class AuthError extends VaultError {
	constructor(detail = "The email or password is incorrect.") {
		super({
			status: 401,
			code: VaultErrorCode.AUTH_INVALID_CREDENTIALS,
			title: "Invalid credentials",
			detail,
			type: "https://docs.vault.dev/errors/auth#invalid-credentials",
			retryable: false,
			docs: "https://docs.vault.dev/auth#troubleshooting",
		});
	}
}

export class BadRequestError extends VaultError {
	constructor(detail = "The request could not be understood or was missing required parameters.") {
		super({
			status: 400,
			code: VaultErrorCode.REQUEST_BAD,
			title: ReasonPhrases.BAD_REQUEST,
			detail,
			type: "https://docs.vault.dev/errors/request#bad-request",
			retryable: true,
			docs: "https://docs.vault.dev/errors/request",
		});
		Object.setPrototypeOf(this, BadRequestError.prototype);
		this.name = "BadRequestError";
	}
}

// export class ForbiddenError extends VaultError {
// 	constructor(detail = "You do not have permission to perform this action.") {
// 		super({
// 			status: 403,
// 			code: "VAULT.AUTH.FORBIDDEN",
// 			title: "Forbidden",
// 			detail,
// 			type: "https://docs.vault.dev/errors/auth#forbidden",
// 			retryable: false,
// 		});
// 	}
// }

// export class ConflictError extends VaultError {
// 	constructor(detail = "The resource is in a conflicting state.") {
// 		super({
// 			status: 409,
// 			code: "VAULT.RESOURCE.CONFLICT",
// 			title: "Conflict",
// 			detail,
// 			type: "https://docs.vault.dev/errors/resource#conflict",
// 			retryable: false,
// 		});
// 	}
// }

// export class RateLimitError extends VaultError {
// 	public limit?: number;
// 	public remaining?: number;
// 	public reset?: number; // epoch seconds
// 	public retryAfter?: number; // seconds

// 	constructor(
// 		opts: {
// 			detail?: string;
// 			limit?: number;
// 			remaining?: number;
// 			reset?: number;
// 			retryAfter?: number;
// 		} = {}
// 	) {
// 		super({
// 			status: 429,
// 			code: "VAULT.RATE_LIMIT.EXCEEDED",
// 			title: "Too many requests",
// 			detail: opts.detail ?? "Rate limit exceeded. Try again after the reset time.",
// 			type: "https://docs.vault.dev/errors/rate-limit#too-many-requests",
// 			retryable: true,
// 			docs: "https://docs.vault.dev/rate-limits",
// 		});
// 		this.limit = opts.limit;
// 		this.remaining = opts.remaining;
// 		this.reset = opts.reset;
// 		this.retryAfter = opts.retryAfter;
// 	}
// }

// export class UpstreamTimeoutError extends VaultError {
// 	constructor(detail = "Upstream service timed out.") {
// 		super({
// 			status: 502,
// 			code: "VAULT.UPSTREAM.TIMEOUT",
// 			title: "Bad gateway",
// 			detail,
// 			type: "https://docs.vault.dev/errors/upstream#timeout",
// 			retryable: true,
// 		});
// 	}
// }

// {
//     "type": "https://docs.vault.dev/errors/request#validation",
//     "title": "Invalid request parameters",
//     "status": 422,
//     "detail": "Some fields failed validation.",
//     "instance": "/v1/users",
//     "code": "VAULT.REQUEST.VALIDATION_FAILED",
//     "request_id": "req_01hzy5d8p3v4s8t9y2m1k0nxa4",
//     "invalid_params": [
//       { "name": "email", "reason": "Must be a valid email address.", "code": "format_email" },
//       { "name": "password", "reason": "Minimum length is 12.", "code": "min_length" }
//     ],
//     "retryable": false,
//     "docs": "https://docs.vault.dev/requests#validation"
//   }
