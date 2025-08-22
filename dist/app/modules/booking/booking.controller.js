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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingControllers = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const booking_service_1 = require("./booking.service");
const createBooking = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedUser = req.user;
    const booking = yield booking_service_1.BookingServices.createBooking(req.body, decodedUser.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: booking
    });
}));
const getAllBookings = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield booking_service_1.BookingServices.getAllBookings();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "All bookings retrieved successfully",
        data: booking
    });
}));
const getUserBookings = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield booking_service_1.BookingServices.getUserBookings();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Booking retrieved successfully",
        data: booking
    });
}));
const getSingleBooking = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield booking_service_1.BookingServices.getSingleBooking();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Single booking retrieved successfully",
        data: booking
    });
}));
const updateBooking = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield booking_service_1.BookingServices.updateBooking();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Booking updated successfully",
        data: booking
    });
}));
exports.BookingControllers = {
    createBooking,
    getAllBookings,
    getUserBookings,
    getSingleBooking,
    updateBooking
};
