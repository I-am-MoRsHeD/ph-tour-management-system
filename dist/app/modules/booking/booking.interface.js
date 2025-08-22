"use strict";
// User -> Booking(Unpaid) -> Payment(Unpaid) -> SSLCommerz -> Booking Update -> Confirm -> Payment update -> paid;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOOKING_STATUS = void 0;
var BOOKING_STATUS;
(function (BOOKING_STATUS) {
    BOOKING_STATUS["PENDING"] = "PENDING";
    BOOKING_STATUS["CANCEL"] = "CANCEL";
    BOOKING_STATUS["COMPLETE"] = "COMPLETE";
    BOOKING_STATUS["FAILED"] = "FAILED";
})(BOOKING_STATUS || (exports.BOOKING_STATUS = BOOKING_STATUS = {}));
;
