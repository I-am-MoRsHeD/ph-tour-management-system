/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { setCookies } from "../../utils/setCookies";
import passport from "passport";
import { createUserTokens } from "../../utils/userTokens";
import { IUser } from "../user/user.interface";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

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

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    passport.authenticate("local", async (err: any, user: any, info: any) => {
        if (err) {
            // egolo use kora jabhena--- X
            // throw new AppError();
            // next(err);
            // return new AppError(401, err);

            // egolo use kora jabhe
            // return next(new AppError(401, err));
            return next(err);
        };
        if (!user) {
            return next(new AppError(401, info.message));
        };

        const userTokens = await createUserTokens(user);
        const { password: pass, ...rest } = user.toObject();

        setCookies(res, userTokens);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "User logged in successfully",
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user: rest
            }
        })
    })(req, res, next)
});

const getNewAccesssToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError(400, "Refresh token not found in cookies!");
    }
    const tokenInfo = await AuthServices.getNewAccesssToken(refreshToken);

    setCookies(res, tokenInfo);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "New access token generated successfully",
        data: tokenInfo
    })
});

const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
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
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User logged out successfully",
        data: null
    })
});

const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const { oldPassword, newPassword } = req.body;
    const decodedToken = req.user;

    const newUpdatePassword = await AuthServices.resetPassword(oldPassword, newPassword, decodedToken as JwtPayload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User logged out successfully",
        data: null
    })
});

// /booking -> /login -> successfully logged in -> redirect to /booking
// /login -> successfully logged in -> home route '/'
const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    const { redirect } = req.query || '/';
    passport.authenticate("google", { scope: ["profile", "email"], state: redirect as string })(req, res, next);
};

const googleLoginCallback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    let redirectTo = req.query.state as string || '/';

    if (redirectTo.startsWith('/')) {
        redirectTo = redirectTo.slice(1);
    }
    const user = req.user as Partial<IUser>;
    // console.log(user);
    if (!user) {
        throw new AppError(404, 'User not found!');
    };

    const tokenInfo = createUserTokens(user);
    setCookies(res, tokenInfo);

    res.redirect(`${envVars.FRONTEND_URL}${redirectTo}`);
});

export const AuthControllers = {
    credentialsLogin,
    getNewAccesssToken,
    logout,
    resetPassword,
    googleLogin,
    googleLoginCallback
}