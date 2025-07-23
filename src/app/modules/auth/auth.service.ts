/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { createNewAccessTokenWithRefreshToken, createUserTokens } from "../../utils/userTokens";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcrypt from "bcryptjs";
import httpStatusCode from "http-status-codes";
import { envVars } from "../../config/env";

const credentialsLogin = async (payload: Partial<IUser>) => {

    const { email, password } = payload;

    const isUserExist = await User.findOne({ email });
    if (!isUserExist) {
        throw new AppError(400, 'Email does not exist');
    };

    const bcryptedPassword = await bcrypt.compare(password as string, isUserExist.password as string);

    if (!bcryptedPassword) {
        throw new AppError(httpStatusCode.BAD_REQUEST, "Password is incorrect");
    };

    const userTokens = createUserTokens(isUserExist);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pass, ...rest } = isUserExist.toObject();

    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest
    };
};

const getNewAccesssToken = async (refreshToken: string) => {
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken);

    return {
        accessToken: newAccessToken,
    };
};

const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

    const existingUser = await User.findById(decodedToken.userId);

    const isPasswordMatched = await bcrypt.compare(oldPassword, existingUser?.password as string);

    if(!isPasswordMatched){
        throw new AppError(403, 'Old password does not match!');
    };

    const hashedPassword = await bcrypt.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUNDS));

    existingUser!.password = hashedPassword;

    existingUser?.save();

};

export const AuthServices = {
    credentialsLogin,
    getNewAccesssToken,
    resetPassword
};