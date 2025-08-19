/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import { BOOKING_STATUS } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLServices } from "../sslCommerz/sslCommerz.service";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";


const initPayment = async (bookingId: string) => {
    const payment = await Payment.findOne({ booking: bookingId });

    if (!payment) {
        throw new AppError(404, 'Payment not found');
    };

    const booking = await Booking.findById(bookingId);

    const userName = (booking?.user as any).name;
    const useremail = (booking?.user as any).email;
    const userPhone = (booking?.user as any).phone;
    const userAddress = (booking?.user as any).address;

    const sslPayload: ISSLCommerz = {
        name: userName,
        email: useremail,
        phone: userPhone,
        address: userAddress,
        amount: payment.amount,
        transactionId: payment.transactionId
    };

    const sslPayment = await SSLServices.sslPaymentInit(sslPayload);

    return {
        paymentUrl: sslPayment.GatewayPageURL,
    }
};
const successPayment = async (query: Record<string, string>) => {
    const transactionId = query.transactionId as string;

    const session = await Booking.startSession();
    session.startTransaction();

    try {
        const updatedPayment = await Payment.findOneAndUpdate({ transactionId: transactionId },
            {
                status: PAYMENT_STATUS.PAID,
            }
            , { session });

        await Booking.findByIdAndUpdate(updatedPayment?.booking, {
            status: BOOKING_STATUS.COMPLETE
        }, { new: true, runValidators: true, session })
            .populate('user', "name email phone address")
            .populate('tour', "title costFrom")
            .populate('payment');

        await session.commitTransaction()
        session.endSession();
        return {
            success: true,
            message: "Payment has been completed sucessfully!"
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const failPayment = async (query: Record<string, string>) => {
    const transactionId = query.transactionId as string;

    const session = await Booking.startSession();
    session.startTransaction();

    try {
        const updatedPayment = await Payment.findOneAndUpdate({ transactionId: transactionId },
            {
                status: PAYMENT_STATUS.FAILED,
            }
            , { session });

        await Booking.findByIdAndUpdate(updatedPayment?.booking, {
            status: BOOKING_STATUS.FAILED
        }, { new: true, runValidators: true, session });

        await session.commitTransaction()
        session.endSession();
        return {
            success: false,
            message: "Payment has been failed!"
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const cancelPayment = async (query: Record<string, string>) => {
    const transactionId = query.transactionId as string;

    const session = await Booking.startSession();
    session.startTransaction();

    try {
        const updatedPayment = await Payment.findOneAndUpdate({ transactionId: transactionId },
            {
                status: PAYMENT_STATUS.CANCELLED,
            }
            , { session });

        await Booking.findByIdAndUpdate(updatedPayment?.booking, {
            status: BOOKING_STATUS.CANCEL
        }, { new: true, runValidators: true, session });

        await session.commitTransaction()
        session.endSession();
        return {
            success: false,
            message: "Payment has been cancelled!"
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

export const PaymentServices = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment
};