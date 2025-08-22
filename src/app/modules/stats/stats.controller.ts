/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { StatsServices } from "./stats.service";
import { sendResponse } from "../../utils/sendResponse";


const getUserStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await StatsServices.getUserStats();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User created successfully",
        data: result
    });
});

const getTourStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await StatsServices.getTourStats();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User created successfully",
        data: result
    });
});

const getBookingStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await StatsServices.getBookingStats();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User created successfully",
        data: result
    });
});

const getPaymentStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await StatsServices.getPaymentStats();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User created successfully",
        data: result
    });
});

export const StatsController = {
    getUserStats,
    getTourStats,
    getBookingStats,
    getPaymentStats
}