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
exports.OTPServices = void 0;
const crypto_1 = __importDefault(require("crypto"));
const redis_config_1 = require("../../config/redis.config");
const sendEmail_1 = require("../../utils/sendEmail");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_model_1 = require("../user/user.model");
const OTP_EXPIRATION = 60 * 2; // 2 minutes
const generateOtp = (length = 6) => {
    const otp = crypto_1.default.randomInt(10 ** (length - 1), 10 ** length);
    return otp;
};
const sendOTP = (email, name) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (!isUserExist) {
        throw new AppError_1.default(400, 'User does not exist');
    }
    ;
    if (isUserExist.isVerified) {
        throw new AppError_1.default(400, 'User is already verified');
    }
    ;
    const otp = generateOtp();
    const redisKey = `otp:${email}`; // eti hocce redis er ekta convention bola jai,ora nijerai bole eibhabe key generate korte!jehetu eita otp er,tai samen otp dewa hoise,meaningful er jonno
    yield redis_config_1.redisClient.set(redisKey, otp, {
        expiration: {
            type: 'EX',
            value: OTP_EXPIRATION
        }
    });
    yield (0, sendEmail_1.sendEmail)({
        to: email,
        subject: 'OTP verification',
        templateName: 'otp',
        templateData: {
            name,
            otp
        }
    });
});
const verifyOTP = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (!isUserExist) {
        throw new AppError_1.default(400, 'User does not exist');
    }
    ;
    const redisKey = `otp:${email}`;
    const savedOtp = yield redis_config_1.redisClient.get(redisKey);
    if (!savedOtp) {
        throw new AppError_1.default(400, 'Invalid Otp');
    }
    ;
    if (savedOtp !== otp) {
        throw new AppError_1.default(400, 'Invalid Otp');
    }
    ;
    yield Promise.all([
        user_model_1.User.updateOne({ email }, { isVerified: true }, { runValidators: true }),
        redis_config_1.redisClient.del(redisKey)
    ]);
});
exports.OTPServices = {
    sendOTP,
    verifyOTP
};
