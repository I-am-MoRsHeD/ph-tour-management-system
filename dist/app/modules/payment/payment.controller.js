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
exports.PaymentController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const payment_service_1 = require("./payment.service");
const env_1 = require("../../config/env");
const sendResponse_1 = require("../../utils/sendResponse");
const sslCommerz_service_1 = require("../sslCommerz/sslCommerz.service");
const initPayment = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    const result = yield payment_service_1.PaymentServices.initPayment(bookingId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Payment done successfully",
        data: result
    });
}));
const successPayment = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield payment_service_1.PaymentServices.successPayment(query);
    console.log(env_1.envVars.SSL.SSL_SUCCESS_FRONTEND_URL);
    if (result.success) {
        res.redirect(`${env_1.envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&status=${query.status}`);
    }
}));
const failPayment = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield payment_service_1.PaymentServices.failPayment(query);
    if (!result.success) {
        res.redirect(`${env_1.envVars.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&status=${query.status}`);
    }
}));
const cancelPayment = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield payment_service_1.PaymentServices.cancelPayment(query);
    if (!result.success) {
        res.redirect(`${env_1.envVars.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&status=${query.status}`);
    }
}));
const getInvoiceURL = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const { paymentId } = req.params;
    const result = yield payment_service_1.PaymentServices.getInvoiceURL(paymentId, decodedToken.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "InvoiceURL retrieved successfully",
        data: result
    });
}));
const validatePayment = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield sslCommerz_service_1.SSLServices.validatePayment(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Payment validated successfully",
        data: null
    });
}));
exports.PaymentController = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceURL,
    validatePayment
};
