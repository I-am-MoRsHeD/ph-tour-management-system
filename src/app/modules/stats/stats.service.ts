import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { Tour } from "../tour/tour.model";
import { Active } from "../user/user.interface";
import { User } from "../user/user.model";

const now = new Date();
const sevenDays = new Date(now).setDate(now.getDate() - 7);
const thirtyDays = new Date(now).setDate(now.getDate() - 30);

const getUserStats = async () => {
    const totalUsersPromise = User.countDocuments();

    const totalActiveUsersPromise = User.countDocuments({ isActive: Active.ACTIVE });
    const totalInctiveUsersPromise = User.countDocuments({ isActive: Active.INACTIVE });
    const totalBlockedUsersPromise = User.countDocuments({ isActive: Active.BLOCKED });

    const newUserInLast7DaysPromise = User.countDocuments({
        createdAt: { $gte: sevenDays }
    });
    const newUserInLast30DaysPromise = User.countDocuments({
        createdAt: { $gte: thirtyDays }
    });

    const userByRolePromise = User.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 }
            }
        }
    ]);

    const [totalUsers, totalActiveUsers, totalInctiveUsers, totalBlockedUsers, newUserInLast7Days, newUserInLast30Days, userByRole] = await Promise.all([
        totalUsersPromise,
        totalActiveUsersPromise,
        totalInctiveUsersPromise,
        totalBlockedUsersPromise,
        newUserInLast7DaysPromise,
        newUserInLast30DaysPromise,
        userByRolePromise
    ])

    return {
        totalUsers,
        totalActiveUsers,
        totalInctiveUsers,
        totalBlockedUsers,
        newUserInLast7Days,
        newUserInLast30Days,
        userByRole
    };
};

const getTourStats = async () => {
    const totalToursPromise = Tour.countDocuments();

    const totalToursByTourTypePromise = Tour.aggregate([
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

    const avgTourCostPromise = Tour.aggregate([
        // stage -1 : group all the tour and do sum and then avg the tours
        {
            $group: {
                _id: 'null',
                avgCostFrom: { $avg: '$costFrom' }
            }
        }
    ]);

    const totalTourByDivisionPromise = Tour.aggregate([
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

    const totalHighestBookedTourPromise = Booking.aggregate([
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
    ])

    const [totalTours, totalToursByTourType, avgTourCost, totalTourByDivision, totalHighestBookedTour] = await Promise.all([
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
};

const getBookingStats = async () => {
    const totalBookingPromise = Booking.countDocuments();

    const totalBookingbyStatusPromise = Booking.aggregate([
        // stage -1 : group based on status
        {
            $group: {
                _id: '$status',
                bookingCount: { $sum: 1 }
            }
        }
    ]);

    const totalBookingsPerTourPromise = Booking.aggregate([
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

    const avgGuestCountPerBookingPromise = Booking.aggregate([
        {
            $group: {
                _id: null,
                avgGuestCount: { $avg: '$guestCount' }
            }
        }
    ]);

    const bookingLast7DaysPromise = Booking.countDocuments({
        createdAt: { $gte: sevenDays }
    });

    const bookingLast30DaysPromise = Booking.countDocuments({
        createdAt: { $gte: thirtyDays }
    });

    const totalBookingByUniqueUsersPromise = Booking.distinct('user').then((user) => user.length);

    const [totalBooking, totalBookingbyStatus, totalBookingsPerTour, avgGuestCountPerBooking, bookingLast7Days, bookingLast30Days, totalBookingByUniqueUsers] = await Promise.all([
        totalBookingPromise,
        totalBookingbyStatusPromise,
        totalBookingsPerTourPromise,
        avgGuestCountPerBookingPromise,
        bookingLast7DaysPromise,
        bookingLast30DaysPromise,
        totalBookingByUniqueUsersPromise
    ])

    return {
        totalBooking,
        totalBookingbyStatus,
        totalBookingsPerTour,
        avgGuestCountPerBooking: avgGuestCountPerBooking[0]?.avgGuestCount,
        bookingLast7Days,
        bookingLast30Days,
        totalBookingByUniqueUsers
    };
};

const getPaymentStats = async () => {
    const totalPaymentPromise = Payment.countDocuments();

    const totalPaymentByStatusPromise = Payment.aggregate([
        {
            $group: {
                _id: '$status',
                paymentCount: { $sum: 1 }
            }
        }
    ]);

    const totalRevenuePromise = Payment.aggregate([
        {
            $match: {
                status: PAYMENT_STATUS.PAID
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$amount' }
            }
        }
    ]);

    const avgPaymentAmountPromise = Payment.aggregate([
        {
            $group: {
                _id: null,
                avgAmount: { $avg: '$amount' }
            }
        }
    ]);

    const paymentGatewayDataPromise = Payment.aggregate([
        {
            $group: {
                _id: { $ifNull: ["$paymentGateway", "UNKNOWN"] },
                count: { $sum: 1 }
            }
        }
    ]);

    const [totalPayment, totalPaymentByStatus, totalRevenue, avgPaymentAmount, paymentGatewayData] = await Promise.all([
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
};

export const StatsServices = {
    getUserStats,
    getTourStats,
    getBookingStats,
    getPaymentStats
}