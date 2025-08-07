import { Router } from "express";
import { validateSchema } from "../../middlewares/validateSchema";
import { createBookingZodSchema } from "./booking.validation";
import { BookingControllers } from "./booking.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";


const router = Router();

router.post('/',
    checkAuth(...Object.values(Role)),
    validateSchema(createBookingZodSchema),
    BookingControllers.createBooking);

router.get('/',
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
    BookingControllers.getAllBookings);

router.get('/',
    checkAuth(...Object.values(Role)),
    BookingControllers.getUserBookings);

router.get('/:bookingId',
    checkAuth(...Object.values(Role)),
    BookingControllers.getSingleBooking);

router.patch('/:bookingId',
    checkAuth(...Object.values(Role)),
    BookingControllers.updateBooking);

export const bookingRoutes = router;