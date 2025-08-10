export enum ErrorCode {
    // General Errors (0-99)
    UNKNOWN_ERROR = 0,
    VALIDATION_ERROR = 1,
    DATABASE_ERROR = 2,

    // Authentication Errors (100-199)
    INVALID_CREDENTIALS = 100,
    ACCESS_TOKEN_EXPIRED = 101,
    REFRESH_TOKEN_EXPIRED = 102,
    ACCOUNT_LOCKED = 103,

    // Resource Errors (200-299)
    RESOURCE_NOT_FOUND = 200,
    RESOURCE_CONFLICT = 201,
    RESOURCE_LIMIT_REACHED = 202,

    // Permission Errors (300-399)
    UNAUTHORIZED_ACCESS = 300,
    INSUFFICIENT_PERMISSIONS = 301,

    // Business Logic Errors (400-499)
    INVALID_OPERATION = 400,
    AUTH_EMAIL_ALREADY_EXISTS = 401,
    PAYMENT_REQUIRED = 402,
    AUTH_USER_CREATION_FAILED = 403,

    // External Service Errors (500-599)
    EXTERNAL_SERVICE_FAILURE = 500,
    THIRD_PARTY_API_ERROR = 501,
}

export const ErrorCodeMessages: Record<ErrorCode, string> = {
    [ErrorCode.UNKNOWN_ERROR]: "An unknown error occurred",
    [ErrorCode.VALIDATION_ERROR]: "Validation failed",
    [ErrorCode.DATABASE_ERROR]: "Database operation failed",
    [ErrorCode.INVALID_CREDENTIALS]: "Invalid email or password",
    [ErrorCode.ACCESS_TOKEN_EXPIRED]: "Access token expired",
    [ErrorCode.REFRESH_TOKEN_EXPIRED]: "Refresh token expired",
    [ErrorCode.ACCOUNT_LOCKED]: "Account is temporarily locked",
    [ErrorCode.RESOURCE_NOT_FOUND]: "Requested resource not found",
    [ErrorCode.RESOURCE_CONFLICT]: "Resource already exists",
    [ErrorCode.RESOURCE_LIMIT_REACHED]: "Resource limit reached",
    [ErrorCode.UNAUTHORIZED_ACCESS]: "Unauthorized access",
    [ErrorCode.INSUFFICIENT_PERMISSIONS]: "Insufficient permissions",
    [ErrorCode.INVALID_OPERATION]: "Invalid operation",
    [ErrorCode.PAYMENT_REQUIRED]: "Payment required",
    [ErrorCode.EXTERNAL_SERVICE_FAILURE]: "External service failure",
    [ErrorCode.THIRD_PARTY_API_ERROR]: "Third-party API error",
    [ErrorCode.AUTH_EMAIL_ALREADY_EXISTS]: "User with this email already exists",
    [ErrorCode.AUTH_USER_CREATION_FAILED]: "User creation failed, please try again later",
};
