import { Router } from "express";
import { AuthControllers } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import passport from "passport";

const router = Router();

router.post('/login', AuthControllers.credentialsLogin);
router.post('/refresh-token', AuthControllers.getNewAccesssToken);
router.post('/logout', AuthControllers.logout);
router.post('/reset-password', checkAuth(...Object.values(Role)), AuthControllers.resetPassword);
router.get('/google', AuthControllers.googleLogin);
router.get('/google/callback', passport.authenticate("google", { failureRedirect: "/login" }), AuthControllers.googleLoginCallback);

export const AuthRoutes = router;