"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const passport_1 = __importDefault(require("passport"));
const env_1 = require("../../config/env");
const router = (0, express_1.Router)();
router.post('/login', auth_controller_1.AuthControllers.credentialsLogin);
router.post('/refresh-token', auth_controller_1.AuthControllers.getNewAccesssToken);
router.post('/logout', auth_controller_1.AuthControllers.logout);
router.post('/change-password', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), auth_controller_1.AuthControllers.changePassword);
router.post('/set-password', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), auth_controller_1.AuthControllers.setPassword);
router.post('/forgot-password', auth_controller_1.AuthControllers.forgotPassword);
router.post('/reset-password', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), auth_controller_1.AuthControllers.resetPassword);
router.get('/google', auth_controller_1.AuthControllers.googleLogin);
router.get('/google/callback', passport_1.default.authenticate("google", { failureRedirect: `${env_1.envVars.FRONTEND_URL}/login?error=There is some issue with yout account. Please contact with our support team.` }), auth_controller_1.AuthControllers.googleLoginCallback);
// frontend -> forgot-password -> backend email receive -> user status check -> short expiration token (valid for 10 minute) -> email -> frontend link http://localhost:5173/reset-password?email=mail@email.com&token=token -> frontend e query tekhe user er email and token extract anbe ->  user new password dibhe -> backend er /reset-password api hit -> authorization a token set -> new password -> token verify -> password hashed -> user password update
exports.AuthRoutes = router;
