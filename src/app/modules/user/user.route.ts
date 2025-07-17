import { Router } from "express";
import { UserControllers } from "./user.controller";
import { createUserZodSchema } from "./user.validation";
import { validateSchema } from "../../middlewares/validateSchema";

const router = Router();

router.post('/register', validateSchema(createUserZodSchema), UserControllers.createUser);
router.get('/all-users', UserControllers.getAllUser);

export const userRoutes = router;