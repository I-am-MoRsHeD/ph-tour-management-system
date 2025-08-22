import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { DivisionRoutes } from "../modules/division/division.route";
import { TourRoutes } from "../modules/tour/tour.route";
import { bookingRoutes } from "../modules/booking/booking.route";
import { paymentRoutes } from "../modules/payment/payment.route";
import { otpRoutes } from "../modules/otp/otp.route";
import { statsRoutes } from "../modules/stats/stats.route";

export const router = Router();

const moduleRoutes = [
    {
        path: '/user',
        route: userRoutes
    },
    {
        path: '/auth',
        route: AuthRoutes
    },
    {
        path: '/division',
        route: DivisionRoutes
    },
    {
        path: '/tour',
        route: TourRoutes
    },
    {
        path : '/booking',
        route: bookingRoutes
    },
    {
        path : '/booking',
        route: bookingRoutes
    },
    {
        path : '/payment',
        route: paymentRoutes
    },
    {
        path : '/otp',
        route: otpRoutes
    },
    {
        path : '/stats',
        route: statsRoutes
    },
];

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route);
})