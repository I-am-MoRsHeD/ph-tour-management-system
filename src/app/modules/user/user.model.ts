import { model, Schema } from "mongoose";
import { Active, IAuthProvider, IUser, Role } from "./user.interface";

const providerSchema = new Schema<IAuthProvider>({
    provider: { type: String, required: true },
    providerId: { type: String, required: true }
}, {
    versionKey: false,
    _id: false
})

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique : true },
    password: { type: String },
    phone: { type: String },
    picture: { type: String },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: {
        type: String,
        enum: Object.values(Active),
        default: Active.ACTIVE
    },
    isVerified: { type: Boolean, default: false },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.USER
    },
    auths: [providerSchema],
}, {
    versionKey: false,
    timestamps: true
});


export const User = model<IUser>("User", userSchema);