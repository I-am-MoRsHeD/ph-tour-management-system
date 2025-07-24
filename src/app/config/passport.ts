/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { IUser, Role } from "../modules/user/user.interface";
import bcrypt from 'bcryptjs';

passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email: string, password: string, done) => {
        try {
            const isUserExist = await User.findOne({ email });
            if (!isUserExist) {
                done(null, false, { message: "User does not exist" });
            };

            const isGoogleAuthenticated = isUserExist?.auths?.some(auth => auth.provider === 'google');
            if (isGoogleAuthenticated && !isUserExist?.password) {
                return done(null, false, { message: "You have logged in through Google. If you want to login with credentials then please login with google and set a password after login. Then you can login with email and password!" });
            };

            const bcryptedPassword = await bcrypt.compare(password as string, isUserExist?.password as string);
            if (!bcryptedPassword) {
                done(null, false, { message: "Password is incorrect" });
            };

            return done(null, isUserExist as Partial<IUser>);
        } catch (error) {
            console.log(error);
            done(error);
        }
    })
)

passport.use(
    new GoogleStrategy({
        clientID: envVars.GOOGLE_CLIENT_ID,
        clientSecret: envVars.GOOGLE_CLIENT_SECRET,
        callbackURL: envVars.GOOGLE_CALLBACK_URL
    }, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
            const email = profile.emails?.[0]?.value;

            if (!email) {
                return done(null, false, { message: "No email found" });
            };

            let user = await User.findOne({ email });

            if (!user) {
                user = await User.create({
                    email,
                    name: profile.displayName,
                    picture: profile.photos?.[0].value,
                    role: Role.USER,
                    isVarified: true,
                    auths: [
                        {
                            provider: "google",
                            providerId: profile.id
                        }
                    ]
                });
            };

            return done(null, user);
        } catch (error) {
            console.log('Google strategy error', error);
            done(error);
        }
    })
);

// ei serialize gulo carao kintu kaj koreche,,

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user?._id);
});

passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        console.log(error);
        done(error);
    }
})



// frontend localhost hit -> localhost:5000/api/v1/auth/google -> passport -> google oauth consent screen -> gmail login -> successful -> callback url hit (api/v1/auth/google/callback) -> db store -> token