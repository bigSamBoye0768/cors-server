import { ErrorRequestHandler } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import AppError from "../utils/errors/base.error";
import { ErrorCode } from "../utils/errors/error-codes";

type ErrorResponse = {
    status: string;
    message: string;
    errorCode?: ErrorCode | null;
    details?: any;
    stack?: string;
};

export const errorHandle: ErrorRequestHandler = (err, req, res, next) => {
    console.error("Error occurred:", err);

    if (err instanceof SyntaxError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            status: ReasonPhrases.BAD_REQUEST,
            message: "Invalid JSON payload",
            error: err.message,
        });
    }

    if (err instanceof AppError) {
        // const response:ErrorResponse = {
        //     status: ReasonPhrases[err.statusCode],
        //     message: err.message,
        // }

        // if (err.errorCode !== undefined && err.errorCode !== null) {
        //     response['errorCode'] = err.errorCode;
        // }

        return res.status(err.statusCode).json({
            // status: ReasonPhrases[err.statusCode],
            message: err.message,
            errorCode: err.errorCode,
            details: err.details,
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        error: err.message || "Something went wrong",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        status: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
};
