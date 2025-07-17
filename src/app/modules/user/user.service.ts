import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import bcrypt from 'bcryptjs';


const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;

    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
        throw new AppError(400, 'User already exists');
    };

    const bcryptedPassword = await bcrypt.hash(password as string, 10);

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
}

export const UserServices = {
    createUser,
    getAllUser
};
