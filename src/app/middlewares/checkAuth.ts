import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/user/user.model";
import { Active } from "../modules/user/user.interface";

export const checkAuth = (...roles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization || req.cookies.accessToken;

        if (!accessToken) {
            throw new AppError(403, "No token received");
        };

        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload;
        const isUserExist = await User.findOne({ email: verifiedToken.email });

        if (!isUserExist) {
            throw new AppError(400, 'User does not exist');
        };
        if (isUserExist && !isUserExist.isVerified) {
            throw new AppError(400, 'User is not verified');
        }
        if (isUserExist.isActive === Active.BLOCKED || isUserExist.isActive === Active.INACTIVE) {
            throw new AppError(400, `User is ${isUserExist.isActive}`);
        };
        if (isUserExist.isDeleted) {
            throw new AppError(400, 'User is deleted!');
        };

        if (!roles.includes(verifiedToken.role)) {
            throw new AppError(403, "You are not permitted to access!!");
        };

        req.user = verifiedToken;
        next();
    } catch (error) {
        next(error);
    }

}