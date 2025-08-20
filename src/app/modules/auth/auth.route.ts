import { Router } from "express";
import { AuthControllers } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import passport from "passport";
import { envVars } from "../../config/env";

const router = Router();

router.post('/login', AuthControllers.credentialsLogin);
router.post('/refresh-token', AuthControllers.getNewAccesssToken);
router.post('/logout', AuthControllers.logout);
router.post('/change-password', checkAuth(...Object.values(Role)), AuthControllers.changePassword);
router.post('/set-password', checkAuth(...Object.values(Role)), AuthControllers.setPassword);
router.post('/forgot-password', AuthControllers.forgotPassword);
router.post('/reset-password', checkAuth(...Object.values(Role)), AuthControllers.resetPassword);

router.get('/google', AuthControllers.googleLogin);
router.get('/google/callback', passport.authenticate("google", { failureRedirect: `${envVars.FRONTEND_URL}/login?error=There is some issue with yout account. Please contact with our support team.` }), AuthControllers.googleLoginCallback);

// frontend -> forgot-password -> backend email receive -> user status check -> short expiration token (valid for 10 minute) -> email -> frontend link http://localhost:5173/reset-password?email=mail@email.com&token=token -> frontend e query tekhe user er email and token extract anbe ->  user new password dibhe -> backend er /reset-password api hit -> authorization a token set -> new password -> token verify -> password hashed -> user password update

export const AuthRoutes = router;