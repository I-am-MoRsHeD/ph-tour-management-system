/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"
import AppError from "../errorHelpers/AppError";
import mongoose from "mongoose";
import { TErrorSources } from "../interfaces/error.types";
import { handleCastError, handleDuplicateError, handleMongooseValidationError, handleZodValidationError } from "../helpers/errorHelperFunctions";
import { deleteImageFromCloudinary } from "../config/cloudinary.config";

/**
 * Mongoose errors
 * 1. Duplicate/Unique error
 * 2. Cast error
 * 3. Validation error
 * 
 * Zod Validation Error
 */
export const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
    if (envVars.NODE_ENV === 'development') console.log(err);

    if (req.file) {
        await deleteImageFromCloudinary(req.file.path);
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        for (const file of req.files) {
            await deleteImageFromCloudinary(file.path);
        }
    }

    let statusCode = 500;
    let message = "Something went wrong!!!";
    let errorSources: TErrorSources[] = [];

    // Duplicate error
    if (err.code === 11000) {
        const simplifiedError = handleDuplicateError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message
    }
    // Cast Error
    else if (err.name === 'CastError') {
        const simplifiedError = handleCastError();
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // Validation Error
    else if (err.name === 'ValidationError') {
        const simplifiedError = handleMongooseValidationError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources as TErrorSources[];
    }
    // Zod validation Error
    else if (err.name === 'ZodError') {
        const simplifiedError = handleZodValidationError(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources as TErrorSources[];
    }
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof Error) {
        statusCode = 500;
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: envVars.NODE_ENV === 'development' ? err : null,
        stack: envVars.NODE_ENV === 'development' ? err.stack : null
    })
}