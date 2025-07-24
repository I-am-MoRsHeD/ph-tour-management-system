/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { TErrorSources, TGenericErrorResponse } from "../interfaces/error.types";

export const handleDuplicateError = (err: any): TGenericErrorResponse => {
    const matchedArray = err.message.match(/"([^"]*)"/);
    return {
        statusCode: 400,
        message: `${matchedArray[1]} alreacy exists.`
    }
};

export const handleCastError = (): TGenericErrorResponse => {
    return {
        statusCode: 400,
        message: 'Invalid Mongoose ObjectId. Please provide a valid ObjectId'
    }
};

export const handleMongooseValidationError = (err: mongoose.Error.ValidationError): TGenericErrorResponse => {
    const errorSources: TErrorSources[] = [];
    const errors = Object.values(err.errors);
    errors.forEach((err: any) => errorSources.push({
        path: err.path,
        message: err.message
    }));
    return {
        statusCode: 400,
        message: "Validation error",
        errorSources
    };
};

export const handleZodValidationError = (err: any): TGenericErrorResponse => {
    const errorSources: TErrorSources[] = [];
    err?.issues.forEach((issue: any) => {
        errorSources.push({
            // path: issue.path.length > 1 && issue.path.reverse().join('inside') -- jodi nested object field validation error hoi,
            path: issue.path[issue.path.length - 1],
            message: issue.message.toLowerCase() === 'required' ? `${issue.path[issue.path.length - 1]} is required` : issue.message
        });
    });

    return {
        statusCode: 400,
        message: "Zod validation error",
        errorSources
    }
}