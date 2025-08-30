/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { DivisionServices } from "./division.service";
import { sendResponse } from "../../utils/sendResponse";
import { IDivision } from "./division.interface";

const createDivision = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload: IDivision = {
        ...req.body,
        thumbnail: req.file?.path
    };
    const division = await DivisionServices.createDivision(payload);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Division created successfully",
        data: division
    });
});

const getAllDivisions = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await DivisionServices.getAllDivisions(query as Record<string, string>);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Divisions retrieved successfully!",
        data: result.data,
        meta: result.meta,
    });
});
const getSingleDivision = catchAsync(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const result = await DivisionServices.getSingleDivision(slug);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Division retrieved successfully",
        data: result.data,
    });
});

const updateDivision = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await DivisionServices.updateDivision(id, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Division is updated successfully",
        data: result,
    });
});

const deleteDivision = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await DivisionServices.deleteDivision(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Division is deleted successfully!",
        data: result,
    });
});

export const DivisionControllers = {
    createDivision,
    getAllDivisions,
    getSingleDivision,
    updateDivision,
    deleteDivision
};