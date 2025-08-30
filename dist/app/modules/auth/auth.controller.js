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
exports.AuthControllers = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const auth_service_1 = require("./auth.service");
const sendResponse_1 = require("../../utils/sendResponse");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const setCookies_1 = require("../../utils/setCookies");
const passport_1 = __importDefault(require("passport"));
const userTokens_1 = require("../../utils/userTokens");
const env_1 = require("../../config/env");
// const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const loginInfo = await AuthServices.credentialsLogin(req.body);
//     setCookies(res, loginInfo);
//     sendResponse(res, {
//         statusCode: 200,
//         success: true,
//         message: "User logged in successfully",
//         data: loginInfo
//     })
// });
const credentialsLogin = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    passport_1.default.authenticate("local", (err, user, info) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            // egolo use kora jabhena--- X
            // throw new AppError();
            // next(err);
            // return new AppError(401, err);
            // egolo use kora jabhe
            // return next(new AppError(401, err));
            return next(err);
        }
        ;
        if (!user) {
            return next(new AppError_1.default(400, info.message));
        }
        ;
        if (!user.isVerified) {
            return next(new AppError_1.default(401, "User is not verified"));
        }
        ;
        const userTokens = yield (0, userTokens_1.createUserTokens)(user);
        const _a = user.toObject(), { password: pass } = _a, rest = __rest(_a, ["password"]);
        (0, setCookies_1.setCookies)(res, userTokens);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: 200,
            success: true,
            message: "User logged in successfully",
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user: rest
            }
        });
    }))(req, res, next);
}));
const getNewAccesssToken = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError_1.default(400, "Refresh token not found in cookies!");
    }
    const tokenInfo = yield auth_service_1.AuthServices.getNewAccesssToken(refreshToken);
    (0, setCookies_1.setCookies)(res, tokenInfo);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "New access token generated successfully",
        data: tokenInfo
    });
}));
const logout = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "User logged out successfully",
        data: null
    });
}));
const changePassword = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, newPassword } = req.body;
    const decodedToken = req.user;
    const newUpdatePassword = yield auth_service_1.AuthServices.changePassword(oldPassword, newPassword, decodedToken);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Password has been changed successfully",
        data: null
    });
}));
const setPassword = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { password } = req.body;
    const decodedToken = req.user;
    yield auth_service_1.AuthServices.setPassword(decodedToken.userId, password);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Password has been set successfully",
        data: null
    });
}));
const forgotPassword = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    yield auth_service_1.AuthServices.forgotPassword(email);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Email has been sent!",
        data: null
    });
}));
// http://localhost:5173/reset-password?id=68a5d55e343a324775346c25&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGE1ZDU1ZTM0M2EzMjQ3NzUzNDZjMjUiLCJlbWFpbCI6Im9tYXRpbnBsYXlzQGdtYWlsLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzU1Njk5MjQ5LCJleHAiOjE3NTU2OTk4NDl9.1YAOs01lRK9C9exJ6lQT9nNHee2HbcKMI2_p9l2GO1g
const resetPassword = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    yield auth_service_1.AuthServices.resetPassword(req.body, decodedToken);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Password has been reseted successfully",
        data: null
    });
}));
// /booking -> /login -> successfully logged in -> redirect to /booking
// /login -> successfully logged in -> home route '/'
const googleLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { redirect } = req.query || '/';
    passport_1.default.authenticate("google", { scope: ["profile", "email"], state: redirect })(req, res, next);
});
const googleLoginCallback = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let redirectTo = req.query.state || '/';
    if (redirectTo.startsWith('/')) {
        redirectTo = redirectTo.slice(1);
    }
    const user = req.user;
    // console.log(user);
    if (!user) {
        throw new AppError_1.default(404, 'User not found!');
    }
    ;
    const tokenInfo = (0, userTokens_1.createUserTokens)(user);
    (0, setCookies_1.setCookies)(res, tokenInfo);
    res.redirect(`${env_1.envVars.FRONTEND_URL}${redirectTo}`);
}));
exports.AuthControllers = {
    credentialsLogin,
    getNewAccesssToken,
    logout,
    changePassword,
    setPassword,
    forgotPassword,
    resetPassword,
    googleLogin,
    googleLoginCallback
};
