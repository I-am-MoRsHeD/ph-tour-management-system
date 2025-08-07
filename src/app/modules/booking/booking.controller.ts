/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BookingServices } from "./booking.service";
import { IBooking } from "./booking.interface";
import { JwtPayload } from "jsonwebtoken";


const createBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedUser = req.user as JwtPayload;

    const booking = await BookingServices.createBooking(req.body, decodedUser.userId);
    sendResponse<IBooking>(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: booking as IBooking
    });
});

const getAllBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const booking = await BookingServices.getAllBookings();
    sendResponse<IBooking>(res, {
        statusCode: 200,
        success: true,
        message: "All bookings retrieved successfully",
        data: {}
    });
});

const getUserBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const booking = await BookingServices.getUserBookings();
    sendResponse<IBooking>(res, {
        statusCode: 200,
        success: true,
        message: "Booking retrieved successfully",
        data: {}
    });
});

const getSingleBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const booking = await BookingServices.getSingleBooking();
    sendResponse<IBooking>(res, {
        statusCode: 200,
        success: true,
        message: "Single booking retrieved successfully",
        data: {}
    });
});

const updateBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const booking = await BookingServices.updateBooking();
    sendResponse<IBooking>(res, {
        statusCode: 200,
        success: true,
        message: "Booking updated successfully",
        data: {}
    });
});

export const BookingControllers = {
    createBooking,
    getAllBookings,
    getUserBookings,
    getSingleBooking,
    updateBooking
};