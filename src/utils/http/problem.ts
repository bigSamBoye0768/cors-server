import { StatusCodes } from "http-status-codes";
import { VaultErrorCode } from "../errors/error-codes";

export interface Problem {
	type: string; // URL to docs for this error (stable)
	title: string; // short human label
	status: StatusCodes; // HTTP status
	detail?: string; // user-safe explanation
	instance?: string; // request path or unique occurrence URL

	// Vault extensions (public, stable)
	code: VaultErrorCode; // machine-stable code, e.g. VAULT.REQUEST.VALIDATION_FAILED
	request_id?: string | undefined; // correlates to logs (X-Request-Id)
	retryable?: boolean | undefined; // whether retry might succeed
	docs?: string | undefined; // handy link to remediation docs
	invalid_params?: InvalidParam[] | undefined; // for 4xx validation issues
	meta?: Record<string, unknown> | undefined; // safe, non-sensitive extras
}

export interface InvalidParam {
	name: string;
	reason: string;
	code?: string;
}
