import { Router } from "express";
import { TourController } from "./tour.controller";
import { Role } from "../user/user.interface";
import { validateSchema } from "../../middlewares/validateSchema";
import { createTourTypeZodSchema, createTourZodSchema, updateTourZodSchema } from "./tour.validation";
import { checkAuth } from "../../middlewares/checkAuth";


const router = Router();

// tour type api routes
router.get("/tour-types", TourController.getAllTourTypes);
router.post(
    "/create-tour-type",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateSchema(createTourTypeZodSchema),
    TourController.createTourType
);
router.patch(
    "/tour-types/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateSchema(createTourTypeZodSchema),
    TourController.updateTourType
);
router.delete("/tour-types/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), TourController.deleteTourType);

// tour api routes
router.get("/", TourController.getAllTours);
router.post(
    "/create",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateSchema(createTourZodSchema),
    TourController.createTour
);
router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateSchema(updateTourZodSchema),
    TourController.updateTour
);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), TourController.deleteTour);

export const TourRoutes = router;