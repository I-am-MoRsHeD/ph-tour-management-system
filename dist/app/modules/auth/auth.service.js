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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const userTokens_1 = require("../../utils/userTokens");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const env_1 = require("../../config/env");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmail_1 = require("../../utils/sendEmail");
const credentialsLogin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (!isUserExist) {
        throw new AppError_1.default(400, 'Email does not exist');
    }
    ;
    const bcryptedPassword = yield bcryptjs_1.default.compare(password, isUserExist.password);
    if (!bcryptedPassword) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Password is incorrect");
    }
    ;
    const userTokens = (0, userTokens_1.createUserTokens)(isUserExist);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _a = isUserExist.toObject(), { password: pass } = _a, rest = __rest(_a, ["password"]);
    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest
    };
});
const getNewAccesssToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const newAccessToken = yield (0, userTokens_1.createNewAccessTokenWithRefreshToken)(refreshToken);
    return {
        accessToken: newAccessToken,
    };
});
const changePassword = (oldPassword, newPassword, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield user_model_1.User.findById(decodedToken.userId);
    const isPasswordMatched = yield bcryptjs_1.default.compare(oldPassword, existingUser === null || existingUser === void 0 ? void 0 : existingUser.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(403, 'Old password does not match!');
    }
    ;
    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, Number(env_1.envVars.BCRYPT_SALT_ROUNDS));
    existingUser.password = hashedPassword;
    existingUser === null || existingUser === void 0 ? void 0 : existingUser.save();
});
const setPassword = (userId, plainPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(404, 'User not found!');
    }
    ;
    if (user.password && user.auths.some(auth => auth.provider === 'google')) {
        throw new AppError_1.default(400, 'You have already set your password!You can change password in your profile!');
    }
    ;
    const hashedPassword = yield bcryptjs_1.default.hash(plainPassword, Number(env_1.envVars.BCRYPT_SALT_ROUNDS));
    const credentialsAuths = {
        provider: "credentials",
        providerId: user.email
    };
    const auths = [...user.auths, credentialsAuths];
    user.auths = auths;
    user.password = hashedPassword;
    yield user.save();
});
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (!isUserExist) {
        throw new AppError_1.default(400, 'User does not exist');
    }
    ;
    if (isUserExist && !isUserExist.isVerified) {
        throw new AppError_1.default(400, 'User is not verified');
    }
    if (isUserExist.isActive === user_interface_1.Active.BLOCKED || isUserExist.isActive === user_interface_1.Active.INACTIVE) {
        throw new AppError_1.default(400, `User is ${isUserExist.isActive}`);
    }
    ;
    if (isUserExist.isDeleted) {
        throw new AppError_1.default(400, 'User is deleted!');
    }
    ;
    const JwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    };
    const resetToken = jsonwebtoken_1.default.sign(JwtPayload, env_1.envVars.JWT_ACCESS_SECRET, { expiresIn: '10m' });
    const resetUILink = `${env_1.envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;
    (0, sendEmail_1.sendEmail)({
        to: isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.email,
        subject: 'Reset Password',
        templateName: 'forgotPassword',
        templateData: {
            name: isUserExist.name,
            resetUILink
        },
    });
});
const resetPassword = (payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    if ((payload === null || payload === void 0 ? void 0 : payload.id) !== (decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.userId)) {
        throw new AppError_1.default(400, 'User does not exist');
    }
    ;
    const isUserExist = yield user_model_1.User.findById(decodedToken.userId);
    if (!isUserExist) {
        throw new AppError_1.default(400, 'User does not exist');
    }
    ;
    const hashedPassword = yield bcryptjs_1.default.hash(payload.newPassword, Number(env_1.envVars.BCRYPT_SALT_ROUNDS));
    isUserExist.password = hashedPassword;
    yield isUserExist.save();
});
exports.AuthServices = {
    credentialsLogin,
    getNewAccesssToken,
    setPassword,
    forgotPassword,
    resetPassword,
    changePassword
};
