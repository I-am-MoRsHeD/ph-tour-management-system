/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";

export enum PAYMENT_STATUS {
    UNPAID = "UNPAID",
    PAID = "PAID",
    REFUNDED = "REFUNDED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
};

export interface IPayment {
    booking: Types.ObjectId,
    transactionId: string,
    amount: number,
    paymentGatewayData?: any,
    invoiceUrl?: string, // optional howar reason hocce eita initially create hobena,after payment,then create hobe
    status: PAYMENT_STATUS
}