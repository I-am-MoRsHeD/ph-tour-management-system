"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourRoutes = void 0;
const express_1 = require("express");
const tour_controller_1 = require("./tour.controller");
const user_interface_1 = require("../user/user.interface");
const validateSchema_1 = require("../../middlewares/validateSchema");
const tour_validation_1 = require("./tour.validation");
const checkAuth_1 = require("../../middlewares/checkAuth");
const multer_config_1 = require("../../config/multer.config");
const router = (0, express_1.Router)();
// tour type api routes
router.get("/tour-types", tour_controller_1.TourController.getAllTourTypes);
router.post("/create-tour-type", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), (0, validateSchema_1.validateSchema)(tour_validation_1.createTourTypeZodSchema), tour_controller_1.TourController.createTourType);
router.patch("/tour-types/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), (0, validateSchema_1.validateSchema)(tour_validation_1.createTourTypeZodSchema), tour_controller_1.TourController.updateTourType);
router.delete("/tour-types/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), tour_controller_1.TourController.deleteTourType);
// tour api routes
router.get("/", tour_controller_1.TourController.getAllTours);
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), multer_config_1.multerUpload.array("files"), //multiple image jabhe,tai array and files likte hoise
(0, validateSchema_1.validateSchema)(tour_validation_1.createTourZodSchema), tour_controller_1.TourController.createTour);
router.patch("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), multer_config_1.multerUpload.array("files"), (0, validateSchema_1.validateSchema)(tour_validation_1.updateTourZodSchema), tour_controller_1.TourController.updateTour);
router.delete("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), tour_controller_1.TourController.deleteTour);
exports.TourRoutes = router;
