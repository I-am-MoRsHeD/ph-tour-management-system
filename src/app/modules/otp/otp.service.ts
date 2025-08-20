import crypto from 'crypto';
import { redisClient } from '../../config/redis.config';
import { sendEmail } from '../../utils/sendEmail';
import AppError from '../../errorHelpers/AppError';
import { User } from '../user/user.model';

const OTP_EXPIRATION = 60 * 2; // 2 minutes

const generateOtp = (length = 6) => {
    const otp = crypto.randomInt(10 ** (length - 1), 10 ** length);

    return otp;
};

const sendOTP = async (email: string, name: string) => {
    const isUserExist = await User.findOne({ email });

    if (!isUserExist) {
        throw new AppError(400, 'User does not exist');
    };
    if (isUserExist.isVerified) {
        throw new AppError(400, 'User is already verified');
    };

    const otp = generateOtp();

    const redisKey = `otp:${email}`; // eti hocce redis er ekta convention bola jai,ora nijerai bole eibhabe key generate korte!jehetu eita otp er,tai samen otp dewa hoise,meaningful er jonno

    await redisClient.set(redisKey, otp, {
        expiration: {
            type: 'EX',
            value: OTP_EXPIRATION
        }
    });

    await sendEmail({
        to: email,
        subject: 'OTP verification',
        templateName: 'otp',
        templateData: {
            name,
            otp
        }
    });
};

const verifyOTP = async (email: string, otp: string) => {
    const isUserExist = await User.findOne({ email });

    if (!isUserExist) {
        throw new AppError(400, 'User does not exist');
    };

    const redisKey = `otp:${email}`;
    const savedOtp = await redisClient.get(redisKey);

    if (!savedOtp) {
        throw new AppError(400, 'Invalid Otp');
    };
    if (savedOtp !== otp) {
        throw new AppError(400, 'Invalid Otp');
    };

    await Promise.all([
        User.updateOne({ email }, { isVerified: true }, { runValidators: true }),
        redisClient.del(redisKey)
    ]);
};

export const OTPServices = {
    sendOTP,
    verifyOTP
}