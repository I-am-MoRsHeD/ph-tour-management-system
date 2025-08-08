import { BOOKING_STATUS } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";


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
        await session.abortTransaction(); // rollback
        session.endSession();
        throw error;
    }
};

const failPayment = async () => {
    return {};
};

const cancelPayment = async () => {
    return {};
};

export const PaymentServices = {
    successPayment,
    failPayment,
    cancelPayment
};