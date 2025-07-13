import { Types } from "mongoose";

export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    USER = "USER",
    GUIDE = "GUIDE"
};
// auth provider 
/**
 * email, password -- credentials login,
 * google authentication
 */
export interface IAuthProvider {
    provider: string; // credentials, google
    providerId: string;
};

export enum Active {
    ACTIVE = "ACTIVE",
    INACTIVE = 'INACTIVE',
    BLOCKED = 'BLOCKED'
};

export interface IUser {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    picture?: string;
    address?: string;
    isDeleted?: string;
    isActive?: Active;
    isVerified?: string;
    role: Role;
    auths: IAuthProvider[];
    bookings?: Types.ObjectId[];
    guides?: Types.ObjectId[];
};