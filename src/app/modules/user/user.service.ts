import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcrypt from 'bcryptjs';
import httpStatus from 'http-status-codes';


const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;

    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
        throw new AppError(400, 'User already exists');
    };

    const bcryptedPassword = await bcrypt.hash(password as string, Number(envVars.BCRYPT_SALT_ROUNDS));

    const authProvider: IAuthProvider = { provider: "credentials", providerId: email as string };

    const user = await User.create({
        email,
        password: bcryptedPassword,
        auths: [authProvider],
        ...rest,
    });
    return user;
};

const getAllUser = async () => {
    const users = await User.find();
    return users;
};

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
    const isUserExist = await User.findById(userId);

    if (!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
    };

    if (payload.role) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not permitted to do this!!");
        };
        if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not permitted to do this!!");
        };
    };

    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not permitted to do this!!");
    }

    if (payload.password) {
        payload.password = await bcrypt.hash(payload.password as string, envVars.BCRYPT_SALT_ROUNDS);
    };

    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });
    return newUpdatedUser;
}

export const UserServices = {
    createUser,
    getAllUser,
    updateUser
};
