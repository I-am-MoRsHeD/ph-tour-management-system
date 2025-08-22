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
exports.StatsServices = void 0;
const booking_model_1 = require("../booking/booking.model");
const payment_interface_1 = require("../payment/payment.interface");
const payment_model_1 = require("../payment/payment.model");
const tour_model_1 = require("../tour/tour.model");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const now = new Date();
const sevenDays = new Date(now).setDate(now.getDate() - 7);
const thirtyDays = new Date(now).setDate(now.getDate() - 30);
const getUserStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalUsersPromise = user_model_1.User.countDocuments();
    const totalActiveUsersPromise = user_model_1.User.countDocuments({ isActive: user_interface_1.Active.ACTIVE });
    const totalInctiveUsersPromise = user_model_1.User.countDocuments({ isActive: user_interface_1.Active.INACTIVE });
    const totalBlockedUsersPromise = user_model_1.User.countDocuments({ isActive: user_interface_1.Active.BLOCKED });
    const newUserInLast7DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: sevenDays }
    });
    const newUserInLast30DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: thirtyDays }
    });
    const userByRolePromise = user_model_1.User.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 }
            }
        }
    ]);
    const [totalUsers, totalActiveUsers, totalInctiveUsers, totalBlockedUsers, newUserInLast7Days, newUserInLast30Days, userByRole] = yield Promise.all([
        totalUsersPromise,
        totalActiveUsersPromise,
        totalInctiveUsersPromise,
        totalBlockedUsersPromise,
        newUserInLast7DaysPromise,
        newUserInLast30DaysPromise,
        userByRolePromise
    ]);
    return {
        totalUsers,
        totalActiveUsers,
        totalInctiveUsers,
        totalBlockedUsers,
        newUserInLast7Days,
        newUserInLast30Days,
        userByRole
    };
});
const getTourStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalToursPromise = tour_model_1.Tour.countDocuments();
    const totalToursByTourTypePromise = tour_model_1.Tour.aggregate([
        // stage - 1 : lookup the tour types
        {
            $lookup: {
                from: 'tourtypes',
                localField: 'tourType',
                foreignField: '_id',
                as: 'type'
            }
        },
        // stage-2 : unwind the tour type from the array
        {
            $unwind: "$type"
        },
        // stage-3 : group the tour based on tourtype
        {
            $group: {
                _id: '$type.name',
                count: { $sum: 1 }
            }
        }
    ]);
    const avgTourCostPromise = tour_model_1.Tour.aggregate([
        // stage -1 : group all the tour and do sum and then avg the tours
        {
            $group: {
                _id: 'null',
                avgCostFrom: { $avg: '$costFrom' }
            }
        }
    ]);
    const totalTourByDivisionPromise = tour_model_1.Tour.aggregate([
        // stage - 1 : lookup the tour based on division
        {
            $lookup: {
                from: 'divisions',
                localField: 'division',
                foreignField: '_id',
                as: 'division'
            }
        },
        // stage-2 : unwind the tour from the array
        {
            $unwind: "$division"
        },
        // stage-3 : group the tour based on division and count
        {
            $group: {
                _id: '$division.name',
                count: { $sum: 1 }
            }
        }
    ]);
    const totalHighestBookedTourPromise = booking_model_1.Booking.aggregate([
        // stage - 1 : group the tour
        {
            $group: {
                _id: '$tour',
                bookingCount: { $sum: 1 }
            }
        },
        // stage - 2 : sort the tour based on count
        {
            $sort: {
                bookingCount: -1
            }
        },
        // stage -3 : limit the tour
        {
            $limit: 5
        },
        // stage - 4 : lookup the tour
        {
            $lookup: {
                from: 'tours',
                // localField : 'tour',
                let: { tourId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$tourId"]
                            }
                        }
                    }
                ],
                as: 'tour'
            }
        },
        // stage - 5 : unwwind the tour 
        {
            $unwind: '$tour'
        },
        // stage -6 : only selected fields
        {
            $project: {
                bookingCount: 1,
                "tour.title": 1,
                "tour.slug": 1
            }
        }
    ]);
    const [totalTours, totalToursByTourType, avgTourCost, totalTourByDivision, totalHighestBookedTour] = yield Promise.all([
        totalToursPromise,
        totalToursByTourTypePromise,
        avgTourCostPromise,
        totalTourByDivisionPromise,
        totalHighestBookedTourPromise
    ]);
    return {
        totalTours,
        totalToursByTourType,
        avgTourCost,
        totalTourByDivision,
        totalHighestBookedTour
    };
});
const getBookingStats = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const totalBookingPromise = booking_model_1.Booking.countDocuments();
    const totalBookingbyStatusPromise = booking_model_1.Booking.aggregate([
        // stage -1 : group based on status
        {
            $group: {
                _id: '$status',
                bookingCount: { $sum: 1 }
            }
        }
    ]);
    const totalBookingsPerTourPromise = booking_model_1.Booking.aggregate([
        {
            $group: {
                _id: '$tour',
                bookingCount: { $sum: 1 }
            }
        },
        {
            $sort: {
                bookingCount: -1
            }
        },
        {
            $limit: 10
        },
        {
            $lookup: {
                from: 'tours',
                localField: '_id',
                foreignField: '_id',
                as: 'tour'
            }
        },
        {
            $unwind: '$tour'
        },
        {
            $project: {
                bookingCount: 1,
                _id: 1,
                "tour.title": 1,
                "tour.slug": 1
            }
        }
    ]);
    const avgGuestCountPerBookingPromise = booking_model_1.Booking.aggregate([
        {
            $group: {
                _id: null,
                avgGuestCount: { $avg: '$guestCount' }
            }
        }
    ]);
    const bookingLast7DaysPromise = booking_model_1.Booking.countDocuments({
        createdAt: { $gte: sevenDays }
    });
    const bookingLast30DaysPromise = booking_model_1.Booking.countDocuments({
        createdAt: { $gte: thirtyDays }
    });
    const totalBookingByUniqueUsersPromise = booking_model_1.Booking.distinct('user').then((user) => user.length);
    const [totalBooking, totalBookingbyStatus, totalBookingsPerTour, avgGuestCountPerBooking, bookingLast7Days, bookingLast30Days, totalBookingByUniqueUsers] = yield Promise.all([
        totalBookingPromise,
        totalBookingbyStatusPromise,
        totalBookingsPerTourPromise,
        avgGuestCountPerBookingPromise,
        bookingLast7DaysPromise,
        bookingLast30DaysPromise,
        totalBookingByUniqueUsersPromise
    ]);
    return {
        totalBooking,
        totalBookingbyStatus,
        totalBookingsPerTour,
        avgGuestCountPerBooking: (_a = avgGuestCountPerBooking[0]) === null || _a === void 0 ? void 0 : _a.avgGuestCount,
        bookingLast7Days,
        bookingLast30Days,
        totalBookingByUniqueUsers
    };
});
const getPaymentStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalPaymentPromise = payment_model_1.Payment.countDocuments();
    const totalPaymentByStatusPromise = payment_model_1.Payment.aggregate([
        {
            $group: {
                _id: '$status',
                paymentCount: { $sum: 1 }
            }
        }
    ]);
    const totalRevenuePromise = payment_model_1.Payment.aggregate([
        {
            $match: {
                status: payment_interface_1.PAYMENT_STATUS.PAID
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$amount' }
            }
        }
    ]);
    const avgPaymentAmountPromise = payment_model_1.Payment.aggregate([
        {
            $group: {
                _id: null,
                avgAmount: { $avg: '$amount' }
            }
        }
    ]);
    const paymentGatewayDataPromise = payment_model_1.Payment.aggregate([
        {
            $group: {
                _id: { $ifNull: ["$paymentGateway", "UNKNOWN"] },
                count: { $sum: 1 }
            }
        }
    ]);
    const [totalPayment, totalPaymentByStatus, totalRevenue, avgPaymentAmount, paymentGatewayData] = yield Promise.all([
        totalPaymentPromise,
        totalPaymentByStatusPromise,
        totalRevenuePromise,
        avgPaymentAmountPromise,
        paymentGatewayDataPromise
    ]);
    return {
        totalPayment,
        totalPaymentByStatus,
        totalRevenue,
        avgPaymentAmount,
        paymentGatewayData
    };
});
exports.StatsServices = {
    getUserStats,
    getTourStats,
    getBookingStats,
    getPaymentStats
};
