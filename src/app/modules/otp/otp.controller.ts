/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { OTPServices } from "./otp.service";


const sendOTP = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, name } = req.body;
    await OTPServices.sendOTP(email, name);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Otp has been sent to your email!",
        data: null
    })
});

const verifyOTP = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;
    await OTPServices.verifyOTP(email, otp);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Otp verified successfully!",
        data: null
    })
});

export const OTPController = {
    sendOTP,
    verifyOTP
}