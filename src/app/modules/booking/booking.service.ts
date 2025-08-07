import AppError from "../../errorHelpers/AppError";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { Tour } from "../tour/tour.model";
import { User } from "../user/user.model";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import { Booking } from "./booking.model";

/**
 * replica DB -> [Database operations] -> (if successfull -> commit to actual databse) -> (if failed -> rollback and abort the transaction)
 */

const getTransactionId = () => {
    return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`
};

const createBooking = async (payload: Partial<IBooking>, userId: string) => {
    const transactionId = getTransactionId();

    const session = await Booking.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(userId);

        if (!user?.phone || !user?.address) {
            throw new AppError(400, "Please update your information!");
        };

        const tour = await Tour.findById(payload.tour).select('costFrom');
        const amount = Number(payload.guestCount) * Number(tour?.costFrom);

        const booking = await Booking.create([
            {
                user: userId,
                status: BOOKING_STATUS.PENDING,
                ...payload
            }
        ], { session });

        const payment = await Payment.create([
            {
                booking: booking[0]._id,
                status: PAYMENT_STATUS.UNPAID,
                transactionId,
                amount,
            }
        ], { session });

        const updateBooking = await Booking.findByIdAndUpdate(booking[0]._id, {
            payment: payment[0]._id
        }, { new: true, runValidators: true, session });

        await session.commitTransaction(); // commit to actual database
        session.endSession();
        return updateBooking
    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession();
        throw error;
    }
};

const getAllBookings = async () => {
    return {};
};

const getUserBookings = async () => {
    return {};
};

const getSingleBooking = async () => {
    return {};
};

const updateBooking = async () => {
    return {};
};

export const BookingServices = {
    createBooking,
    getAllBookings,
    getUserBookings,
    getSingleBooking,
    updateBooking
};