/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentServices } from "./payment.service";
import { envVars } from "../../config/env";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { SSLServices } from "../sslCommerz/sslCommerz.service";


const initPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { bookingId } = req.params;
    const result = await PaymentServices.initPayment(bookingId as string);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Payment done successfully",
        data: result
    });
});
const successPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as Record<string, string>;
    const result = await PaymentServices.successPayment(query);

    if (result.success) {
        res.redirect(`${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&status=${query.status}`);
    }
});

const failPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as Record<string, string>;
    const result = await PaymentServices.failPayment(query);

    if (!result.success) {
        res.redirect(`${envVars.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&status=${query.status}`);
    }

});

const cancelPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as Record<string, string>;
    const result = await PaymentServices.cancelPayment(query);

    if (!result.success) {
        res.redirect(`${envVars.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&status=${query.status}`);
    }

});

const getInvoiceURL = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const { paymentId } = req.params;
    const result = await PaymentServices.getInvoiceURL(paymentId as string, decodedToken.userId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "InvoiceURL retrieved successfully",
        data: result
    });
});

const validatePayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log("validate payment body data", req.body);
    await SSLServices.validatePayment(req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Payment validated successfully",
        data: null
    });
});

export const PaymentController = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceURL,
    validatePayment
}