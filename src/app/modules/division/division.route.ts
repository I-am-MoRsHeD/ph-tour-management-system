import { Router } from "express";
import { DivisionControllers } from "./division.controller";
import { validateSchema } from "../../middlewares/validateSchema";
import { createDivisionZodSchema, updateDivisionZodSchema } from "./division.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post('/create', validateSchema(createDivisionZodSchema), checkAuth(Role.ADMIN, Role.SUPER_ADMIN), DivisionControllers.createDivision);
router.get('/', DivisionControllers.getAllDivisions);
router.get('/:slug', DivisionControllers.getSingleDivision);
router.patch('/:id', validateSchema(updateDivisionZodSchema), checkAuth(Role.ADMIN, Role.SUPER_ADMIN), DivisionControllers.updateDivision);
router.delete('/:id', DivisionControllers.deleteDivision);

export const DivisionRoutes = router;