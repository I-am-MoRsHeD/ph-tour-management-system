/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentServices } from "./payment.service";
import { envVars } from "../../config/env";
import { sendResponse } from "../../utils/sendResponse";


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

export const PaymentController = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment
}