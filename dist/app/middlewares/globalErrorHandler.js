"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const env_1 = require("../config/env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const errorHelperFunctions_1 = require("../helpers/errorHelperFunctions");
const cloudinary_config_1 = require("../config/cloudinary.config");
/**
 * Mongoose errors
 * 1. Duplicate/Unique error
 * 2. Cast error
 * 3. Validation error
 *
 * Zod Validation Error
 */
const globalErrorHandler = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (env_1.envVars.NODE_ENV === 'development')
        console.log(err);
    if (req.file) {
        yield (0, cloudinary_config_1.deleteImageFromCloudinary)(req.file.path);
    }
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        for (const file of req.files) {
            yield (0, cloudinary_config_1.deleteImageFromCloudinary)(file.path);
        }
    }
    let statusCode = 500;
    let message = "Something went wrong!!!";
    let errorSources = [];
    // Duplicate error
    if (err.code === 11000) {
        const simplifiedError = (0, errorHelperFunctions_1.handleDuplicateError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // Cast Error
    else if (err.name === 'CastError') {
        const simplifiedError = (0, errorHelperFunctions_1.handleCastError)();
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
    }
    // Validation Error
    else if (err.name === 'ValidationError') {
        const simplifiedError = (0, errorHelperFunctions_1.handleMongooseValidationError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    }
    // Zod validation Error
    else if (err.name === 'ZodError') {
        const simplifiedError = (0, errorHelperFunctions_1.handleZodValidationError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    }
    else if (err instanceof AppError_1.default) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof Error) {
        statusCode = 500;
        message = err.message;
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: env_1.envVars.NODE_ENV === 'development' ? err : null,
        stack: env_1.envVars.NODE_ENV === 'development' ? err.stack : null
    });
});
exports.globalErrorHandler = globalErrorHandler;
