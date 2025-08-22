"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const getTransactionId_1 = require("../../utils/getTransactionId");
const payment_interface_1 = require("../payment/payment.interface");
const payment_model_1 = require("../payment/payment.model");
const sslCommerz_service_1 = require("../sslCommerz/sslCommerz.service");
const tour_model_1 = require("../tour/tour.model");
const user_model_1 = require("../user/user.model");
const booking_interface_1 = require("./booking.interface");
const booking_model_1 = require("./booking.model");
/**
 * replica DB -> [Database operations] -> (if successfull -> commit to actual databse) -> (if failed -> rollback and abort the transaction)
 */
const createBooking = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const transactionId = (0, getTransactionId_1.getTransactionId)();
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const user = yield user_model_1.User.findById(userId);
        if (!(user === null || user === void 0 ? void 0 : user.phone) || !(user === null || user === void 0 ? void 0 : user.address)) {
            throw new AppError_1.default(400, "Please update your information!");
        }
        ;
        const tour = yield tour_model_1.Tour.findById(payload.tour).select('costFrom');
        const amount = Number(payload.guestCount) * Number(tour === null || tour === void 0 ? void 0 : tour.costFrom);
        const booking = yield booking_model_1.Booking.create([
            Object.assign({ user: userId, status: booking_interface_1.BOOKING_STATUS.PENDING }, payload)
        ], { session });
        const payment = yield payment_model_1.Payment.create([
            {
                booking: booking[0]._id,
                status: payment_interface_1.PAYMENT_STATUS.UNPAID,
                transactionId,
                amount,
            }
        ], { session });
        const updateBooking = yield booking_model_1.Booking.findByIdAndUpdate(booking[0]._id, {
            payment: payment[0]._id
        }, { new: true, runValidators: true, session })
            .populate('user', "name email phone address")
            .populate('tour', "title costFrom")
            .populate('payment');
        const userName = (updateBooking === null || updateBooking === void 0 ? void 0 : updateBooking.user).name;
        const useremail = (updateBooking === null || updateBooking === void 0 ? void 0 : updateBooking.user).email;
        const userPhone = (updateBooking === null || updateBooking === void 0 ? void 0 : updateBooking.user).phone;
        const userAddress = (updateBooking === null || updateBooking === void 0 ? void 0 : updateBooking.user).address;
        const sslPayload = {
            name: userName,
            email: useremail,
            phone: userPhone,
            address: userAddress,
            amount: amount,
            transactionId: transactionId
        };
        const sslPayment = yield sslCommerz_service_1.SSLServices.sslPaymentInit(sslPayload);
        yield session.commitTransaction(); // commit to actual database
        session.endSession();
        return {
            paymentUrl: sslPayment.GatewayPageURL,
            booking: updateBooking
        };
    }
    catch (error) {
        yield session.abortTransaction(); // rollback
        session.endSession();
        throw error;
    }
});
// Frontend(localhost:5173) - User - Tour - Booking (Pending) - Payment(Unpaid) -> SSLCommerz Page -> Payment Complete -> Backend(localhost:5000/api/v1/payment/success) -> Update Payment(PAID) & Booking(CONFIRM) -> redirect to frontend -> Frontend(localhost:5173/payment/success)
// Frontend(localhost:5173) - User - Tour - Booking (Pending) - Payment(Unpaid) -> SSLCommerz Page -> Payment Fail / Cancel -> Backend(localhost:5000/api/v1/payment/fail or cancel) -> Update Payment(FAIL / CANCEL) & Booking(FAIL / CANCEL) -> redirect to frontend -> Frontend(localhost:5173/payment/cancel or localhost:5173/payment/fail)
const getAllBookings = () => __awaiter(void 0, void 0, void 0, function* () {
    return {};
});
const getUserBookings = () => __awaiter(void 0, void 0, void 0, function* () {
    return {};
});
const getSingleBooking = () => __awaiter(void 0, void 0, void 0, function* () {
    return {};
});
const updateBooking = () => __awaiter(void 0, void 0, void 0, function* () {
    return {};
});
exports.BookingServices = {
    createBooking,
    getAllBookings,
    getUserBookings,
    getSingleBooking,
    updateBooking
};
