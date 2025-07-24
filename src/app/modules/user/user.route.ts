import { Router } from "express";
import { UserControllers } from "./user.controller";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { validateSchema } from "../../middlewares/validateSchema";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

const router = Router();

router.post('/register',
    validateSchema(createUserZodSchema),
    UserControllers.createUser);
router.get('/all-users', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUser);
router.patch('/:id', checkAuth(...Object.values(Role)), validateSchema(updateUserZodSchema), UserControllers.updateUser);

export const userRoutes = router;