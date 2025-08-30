"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_local_1 = require("passport-local");
const env_1 = require("./env");
const user_model_1 = require("../modules/user/user.model");
const user_interface_1 = require("../modules/user/user.interface");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: "email",
    passwordField: "password"
}, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const isUserExist = yield user_model_1.User.findOne({ email });
        if (!isUserExist) {
            return done(null, false, { message: "User does not exist" });
        }
        ;
        const bcryptedPassword = yield bcryptjs_1.default.compare(password, isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.password);
        if (!bcryptedPassword) {
            return done(null, false, { message: "Password is incorrect" });
        }
        ;
        if (isUserExist && (isUserExist.isActive === user_interface_1.Active.BLOCKED || isUserExist.isActive === user_interface_1.Active.INACTIVE)) {
            return done(null, false, { message: `User is ${isUserExist.isActive}` });
        }
        ;
        if (isUserExist && isUserExist.isDeleted) {
            return done(null, false, { message: 'User is deleted!' });
        }
        ;
        const isGoogleAuthenticated = (_a = isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.auths) === null || _a === void 0 ? void 0 : _a.some(auth => auth.provider === 'google');
        if (isGoogleAuthenticated && !(isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.password)) {
            return done(null, false, { message: "You have logged in through Google. If you want to login with credentials then please login with google and set a password after login. Then you can login with email and password!" });
        }
        ;
        // const bcryptedPassword = await bcrypt.compare(password as string, isUserExist?.password as string);
        // if (!bcryptedPassword) {
        //     return done(null, false, { message: "Password is incorrect" });
        // };
        return done(null, isUserExist);
    }
    catch (error) {
        console.log(error);
        done(error);
    }
})));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: env_1.envVars.GOOGLE_CLIENT_ID,
    clientSecret: env_1.envVars.GOOGLE_CLIENT_SECRET,
    callbackURL: env_1.envVars.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const email = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
        if (!email) {
            return done(null, false, { message: "No email found" });
        }
        ;
        let isUserExist = yield user_model_1.User.findOne({ email });
        if (isUserExist && (isUserExist.isActive === user_interface_1.Active.BLOCKED || isUserExist.isActive === user_interface_1.Active.INACTIVE)) {
            return done(null, false, { message: `User is ${isUserExist.isActive}` });
        }
        ;
        if (isUserExist && isUserExist.isDeleted) {
            return done(null, false, { message: 'User is deleted!' });
        }
        ;
        if (!isUserExist) {
            isUserExist = yield user_model_1.User.create({
                email,
                name: profile.displayName,
                picture: (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0].value,
                role: user_interface_1.Role.USER,
                isVarified: true,
                auths: [
                    {
                        provider: "google",
                        providerId: profile.id
                    }
                ]
            });
        }
        ;
        return done(null, isUserExist);
    }
    catch (error) {
        console.log('Google strategy error', error);
        done(error);
    }
})));
// ei serialize gulo carao kintu kaj koreche,,
passport_1.default.serializeUser((user, done) => {
    done(null, user === null || user === void 0 ? void 0 : user._id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findById(id);
        done(null, user);
    }
    catch (error) {
        console.log(error);
        done(error);
    }
}));
// frontend localhost hit -> localhost:5000/api/v1/auth/google -> passport -> google oauth consent screen -> gmail login -> successful -> callback url hit (api/v1/auth/google/callback) -> db store -> token
