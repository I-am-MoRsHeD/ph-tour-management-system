/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { createNewAccessTokenWithRefreshToken, createUserTokens } from "../../utils/userTokens";
import { Active, IAuthProvider, IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcrypt from "bcryptjs";
import httpStatusCode from "http-status-codes";
import { envVars } from "../../config/env";
import jwt from 'jsonwebtoken';
import { sendEmail } from "../../utils/sendEmail";

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

const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

    const existingUser = await User.findById(decodedToken.userId);

    const isPasswordMatched = await bcrypt.compare(oldPassword, existingUser?.password as string);

    if (!isPasswordMatched) {
        throw new AppError(403, 'Old password does not match!');
    };

    const hashedPassword = await bcrypt.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUNDS));

    existingUser!.password = hashedPassword;

    existingUser?.save();

};

const setPassword = async (userId: string, plainPassword: string) => {

    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(404, 'User not found!');
    };

    if (user.password && user.auths.some(auth => auth.provider === 'google')) {
        throw new AppError(400, 'You have already set your password!You can change password in your profile!');
    };

    const hashedPassword = await bcrypt.hash(plainPassword, Number(envVars.BCRYPT_SALT_ROUNDS));
    const credentialsAuths: IAuthProvider = {
        provider: "credentials",
        providerId: user.email
    };
    const auths: IAuthProvider[] = [...user.auths, credentialsAuths];

    user.auths = auths;
    user.password = hashedPassword;

    await user.save();

};

const forgotPassword = async (email: string) => {

    const isUserExist = await User.findOne({ email });

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

    const JwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    };

    const resetToken = jwt.sign(JwtPayload, envVars.JWT_ACCESS_SECRET, { expiresIn: '10m' });

    const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;

    sendEmail({
        to: isUserExist?.email,
        subject: 'Reset Password',
        templateName: 'forgotPassword',
        templateData: {
            name: isUserExist.name,
            resetUILink
        },
    });

};

const resetPassword = async (payload: Record<string, any>, decodedToken: JwtPayload) => {
    if (payload?.id !== decodedToken?.userId) {
        throw new AppError(400, 'User does not exist');
    };

    const isUserExist = await User.findById(decodedToken.userId);

    if (!isUserExist) {
        throw new AppError(400, 'User does not exist');
    };

    const hashedPassword = await bcrypt.hash(payload.newPassword, Number(envVars.BCRYPT_SALT_ROUNDS));

    isUserExist.password = hashedPassword;

    await isUserExist.save();
};

export const AuthServices = {
    credentialsLogin,
    getNewAccesssToken,
    setPassword,
    forgotPassword,
    resetPassword,
    changePassword
};