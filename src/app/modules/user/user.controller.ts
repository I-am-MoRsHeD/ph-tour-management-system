/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { IUser } from "./user.interface";

const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);
    sendResponse<IUser>(res, {
        statusCode: 201,
        success: true,
        message: "User created successfully",
        data: user
    });
});

const getAllUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await UserServices.getAllUser();
    sendResponse<IUser[]>(res, {
        statusCode: 200,
        success: true,
        message: "User retrieved successfully",
        data: users
    });
})

export const UserControllers = {
    createUser,
    getAllUser
};


// controllers <-- services <-- models <-- model <-- db