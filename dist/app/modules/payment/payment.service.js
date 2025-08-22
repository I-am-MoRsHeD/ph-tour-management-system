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
exports.PaymentServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const cloudinary_config_1 = require("../../config/cloudinary.config");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const invoice_1 = require("../../utils/invoice");
const sendEmail_1 = require("../../utils/sendEmail");
const booking_interface_1 = require("../booking/booking.interface");
const booking_model_1 = require("../booking/booking.model");
const sslCommerz_service_1 = require("../sslCommerz/sslCommerz.service");
const user_model_1 = require("../user/user.model");
const payment_interface_1 = require("./payment.interface");
const payment_model_1 = require("./payment.model");
const initPayment = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.Payment.findOne({ booking: bookingId });
    if (!payment) {
        throw new AppError_1.default(404, 'Payment not found');
    }
    ;
    const booking = yield booking_model_1.Booking.findById(bookingId);
    const userName = (booking === null || booking === void 0 ? void 0 : booking.user).name;
    const useremail = (booking === null || booking === void 0 ? void 0 : booking.user).email;
    const userPhone = (booking === null || booking === void 0 ? void 0 : booking.user).phone;
    const userAddress = (booking === null || booking === void 0 ? void 0 : booking.user).address;
    const sslPayload = {
        name: userName,
        email: useremail,
        phone: userPhone,
        address: userAddress,
        amount: payment.amount,
        transactionId: payment.transactionId
    };
    const sslPayment = yield sslCommerz_service_1.SSLServices.sslPaymentInit(sslPayload);
    return {
        paymentUrl: sslPayment.GatewayPageURL,
    };
});
const successPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const transactionId = query.transactionId;
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.PAID,
        }, { session });
        const updatedBooking = yield booking_model_1.Booking.findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, {
            status: booking_interface_1.BOOKING_STATUS.COMPLETE
        }, { new: true, runValidators: true, session })
            .populate('user', "name email phone address")
            .populate('tour', "title costFrom")
            .populate('payment');
        if (!updatedBooking) {
            throw new AppError_1.default(401, 'Booking not found!');
        }
        ;
        const invoiceData = {
            bookingDate: updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.createdAt,
            guestCount: updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.guestCount,
            totalAmount: updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.amount,
            transactionId: updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.transactionId,
            tourTitle: (_a = updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.tour) === null || _a === void 0 ? void 0 : _a.title,
            userName: (_b = updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user) === null || _b === void 0 ? void 0 : _b.name
        };
        const pdfBuffer = yield (0, invoice_1.generatePdf)(invoiceData);
        const cloudinaryResult = yield (0, cloudinary_config_1.uploadBufferToCloudinary)(pdfBuffer, 'invoice');
        yield payment_model_1.Payment.findOneAndUpdate({ transactionId: transactionId }, {
            invoiceUrl: cloudinaryResult === null || cloudinaryResult === void 0 ? void 0 : cloudinaryResult.secure_url
        }, { runValidators: true, session });
        yield (0, sendEmail_1.sendEmail)({
            to: (_c = updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user) === null || _c === void 0 ? void 0 : _c.email,
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
        });
        yield session.commitTransaction();
        session.endSession();
        return {
            success: true,
            message: "Payment has been completed sucessfully!"
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const failPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const transactionId = query.transactionId;
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.FAILED,
        }, { session });
        yield booking_model_1.Booking.findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, {
            status: booking_interface_1.BOOKING_STATUS.FAILED
        }, { new: true, runValidators: true, session });
        yield session.commitTransaction();
        session.endSession();
        return {
            success: false,
            message: "Payment has been failed!"
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const cancelPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const transactionId = query.transactionId;
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.CANCELLED,
        }, { session });
        yield booking_model_1.Booking.findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, {
            status: booking_interface_1.BOOKING_STATUS.CANCEL
        }, { new: true, runValidators: true, session });
        yield session.commitTransaction();
        session.endSession();
        return {
            success: false,
            message: "Payment has been cancelled!"
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const getInvoiceURL = (paymentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(401, 'User not found!');
    }
    ;
    const payment = yield payment_model_1.Payment.findById(paymentId)
        .select("invoiceUrl")
        .populate({
        path: "booking",
        populate: {
            path: "user",
            select: "email"
        }
    });
    if (!payment) {
        throw new AppError_1.default(401, 'Payment not found!');
    }
    ;
    if (((_b = (_a = payment === null || payment === void 0 ? void 0 : payment.booking) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.email) !== (user === null || user === void 0 ? void 0 : user.email)) {
        throw new AppError_1.default(401, 'Unauthorized!');
    }
    ;
    if (!payment.invoiceUrl) {
        throw new AppError_1.default(401, 'Invoice not found!');
    }
    ;
    return payment.invoiceUrl;
});
exports.PaymentServices = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceURL
};
