/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentServices } from "./payment.service";
import { envVars } from "../../config/env";


const successPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as Record<string, string>;
    const result = await PaymentServices.successPayment(query);

    if (result.success) {
        res.redirect(`${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&status=${query.status}`);
    }
});

const failPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const booking = await PaymentServices.failPayment();

});

const cancelPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const booking = await PaymentServices.cancelPayment();

});

export const PaymentController = {
    successPayment,
    failPayment,
    cancelPayment
}