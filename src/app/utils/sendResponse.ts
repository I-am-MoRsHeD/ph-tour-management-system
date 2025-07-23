import { Response } from "express";

interface TMeta {
    total: number;
};

interface TResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
    meta?: TMeta
};

export const sendResponse = <T>(res: Response, data: TResponse<T>) => {
    const { statusCode, success, message, meta } = data;

    res.status(statusCode).json({
        statusCode,
        success,
        message,
        data: data.data,
        meta
    });
}