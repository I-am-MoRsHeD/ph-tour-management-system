"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleZodValidationError = exports.handleMongooseValidationError = exports.handleCastError = exports.handleDuplicateError = void 0;
const handleDuplicateError = (err) => {
    const matchedArray = err.message.match(/"([^"]*)"/);
    return {
        statusCode: 400,
        message: `${matchedArray[1]} alreacy exists.`
    };
};
exports.handleDuplicateError = handleDuplicateError;
const handleCastError = () => {
    return {
        statusCode: 400,
        message: 'Invalid Mongoose ObjectId. Please provide a valid ObjectId'
    };
};
exports.handleCastError = handleCastError;
const handleMongooseValidationError = (err) => {
    const errorSources = [];
    const errors = Object.values(err.errors);
    errors.forEach((err) => errorSources.push({
        path: err.path,
        message: err.message
    }));
    return {
        statusCode: 400,
        message: "Validation error",
        errorSources
    };
};
exports.handleMongooseValidationError = handleMongooseValidationError;
const handleZodValidationError = (err) => {
    const errorSources = [];
    err === null || err === void 0 ? void 0 : err.issues.forEach((issue) => {
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
    };
};
exports.handleZodValidationError = handleZodValidationError;
