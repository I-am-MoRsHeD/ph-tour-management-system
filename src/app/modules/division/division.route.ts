import { Router } from "express";
import { DivisionControllers } from "./division.controller";
import { validateSchema } from "../../middlewares/validateSchema";
import { createDivisionZodSchema, updateDivisionZodSchema } from "./division.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post('/create',
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.single("file"),
    validateSchema(createDivisionZodSchema),
    DivisionControllers.createDivision);
router.get('/', DivisionControllers.getAllDivisions);
router.get('/:slug', DivisionControllers.getSingleDivision);
router.patch('/:id',
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.single("file"),
    validateSchema(updateDivisionZodSchema),
    DivisionControllers.updateDivision);
router.delete('/:id', DivisionControllers.deleteDivision);

export const DivisionRoutes = router;