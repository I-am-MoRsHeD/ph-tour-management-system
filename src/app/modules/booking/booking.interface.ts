// User -> Booking(Unpaid) -> Payment(Unpaid) -> SSLCommerz -> Booking Update -> Confirm -> Payment update -> paid;

import { Types } from "mongoose";

export enum BOOKING_STATUS {
    PENDING = 'PENDING',
    CANCEL = 'CANCEL',
    COMPLETE = 'COMPLETE',
    FAILED = 'FAILED',
};

export interface IBooking {
    user: Types.ObjectId,
    tour: Types.ObjectId,
    payment?: Types.ObjectId,
    guestCount: number,
    status: BOOKING_STATUS;
    createdAt?: Date,
}