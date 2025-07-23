import { envVars } from "../config/env"
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcrypt from 'bcryptjs';


export const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExist = await User.findOne({ email: envVars.SUPER_ADMIN_EMAIL });

        if (isSuperAdminExist) {
            console.log('Super admin already exists!');
            return;
        };

        const authProviders: IAuthProvider = {
            provider: 'credentials',
            providerId: envVars.SUPER_ADMIN_EMAIL
        };

        const bcryptedPassword = await bcrypt.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUNDS));

        const payload: IUser = {
            name: "Super Admin",
            email: envVars.SUPER_ADMIN_EMAIL,
            password: bcryptedPassword,
            role: Role.SUPER_ADMIN,
            isVerified: true,
            auths: [authProviders]
        }
        const superAdmin = await User.create(payload);
        console.log(superAdmin);
    } catch (error) {
        console.log(error);
    }
}