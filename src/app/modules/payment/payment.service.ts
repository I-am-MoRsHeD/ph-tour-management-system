/* eslint-disable @typescript-eslint/no-explicit-any */
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { generatePdf, IInvoiceData } from "../../utils/invoice";
import { sendEmail } from "../../utils/sendEmail";
import { BOOKING_STATUS } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLServices } from "../sslCommerz/sslCommerz.service";
import { ITour } from "../tour/tour.interface";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
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

        const updatedBooking = await Booking.findByIdAndUpdate(updatedPayment?.booking, {
            status: BOOKING_STATUS.COMPLETE
        }, { new: true, runValidators: true, session })
            .populate('user', "name email phone address")
            .populate('tour', "title costFrom")
            .populate('payment');

        if (!updatedBooking) {
            throw new AppError(401, 'Booking not found!');
        };

        const invoiceData: IInvoiceData = {
            bookingDate: updatedBooking?.createdAt as Date,
            guestCount: updatedBooking?.guestCount as number,
            totalAmount: updatedPayment?.amount as number,
            transactionId: updatedPayment?.transactionId as string,
            tourTitle: (updatedBooking?.tour as unknown as ITour)?.title as string,
            userName: (updatedBooking?.user as unknown as IUser)?.name as string
        };

        const pdfBuffer = await generatePdf(invoiceData);

        const cloudinaryResult = await uploadBufferToCloudinary(pdfBuffer, 'invoice') as any;

        await Payment.findOneAndUpdate({ transactionId: transactionId },
            {
                invoiceUrl: cloudinaryResult?.secure_url
            }
            , { runValidators: true, session });

        await sendEmail({
            to: (updatedBooking?.user as unknown as IUser)?.email as string,
            subject: "Your Booking Invoice",
            templateName: 'invoice',
            templateData: invoiceData,
            attachments: [
                {
                    filename: "invoice.pdf",
                    content: pdfBuffer,
                    contentType: "application/pdf"
                }
            ]
        })

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

const getInvoiceURL = async (paymentId: string, userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(401, 'User not found!');
    };

    const payment = await Payment.findById(paymentId)
        .select("invoiceUrl")
        .populate({
            path: "booking",
            populate: {
                path: "user",
                select: "email"
            }
        });

    if (!payment) {
        throw new AppError(401, 'Payment not found!');
    };

    if ((payment?.booking as any)?.user?.email !== user?.email) {
        throw new AppError(401, 'Unauthorized!');
    };

    if (!payment.invoiceUrl) {
        throw new AppError(401, 'Invoice not found!');
    };

    return payment.invoiceUrl;
};

export const PaymentServices = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceURL
};