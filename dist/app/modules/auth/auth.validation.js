"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordZodValidation = void 0;
const zod_1 = __importDefault(require("zod"));
exports.resetPasswordZodValidation = zod_1.default.object({
    id: zod_1.default
        .string({ invalid_type_error: "Name must be string" }),
    newPassword: zod_1.default
        .string({ invalid_type_error: "Password must be string" })
        .min(8, { message: "Password must be at least 8 characters long." })
        .regex(/^(?=.*[A-Z])/, {
        message: "Password must contain at least 1 uppercase letter.",
    })
        .regex(/^(?=.*[!@#$%^&*])/, {
        message: "Password must contain at least 1 special character.",
    })
        .regex(/^(?=.*\d)/, {
        message: "Password must contain at least 1 number.",
    })
});
