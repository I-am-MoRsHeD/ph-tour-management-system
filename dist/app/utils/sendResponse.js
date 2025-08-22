"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
;
;
const sendResponse = (res, data) => {
    const { statusCode, success, message, meta } = data;
    res.status(statusCode).json({
        statusCode,
        success,
        message,
        data: data.data,
        meta
    });
};
exports.sendResponse = sendResponse;
