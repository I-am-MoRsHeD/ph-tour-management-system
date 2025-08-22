"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./app/routes");
require("./app/config/passport");
const globalErrorHandler_1 = require("./app/middlewares/globalErrorHandler");
const notFound_1 = __importDefault(require("./app/middlewares/notFound"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const env_1 = require("./app/config/env");
const app = (0, express_1.default)();
app.use((0, express_session_1.default)({
    secret: env_1.envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.set("trust proxy", 1); // external proxy/livelink gulo support/trust korar jonno
app.use(express_1.default.urlencoded({ extended: true })); // form data handle er ketre kono issue na howar jonno
app.use((0, cors_1.default)({
    origin: env_1.envVars.FRONTEND_URL,
    credentials: true
}));
app.use('/api/v1', routes_1.router);
app.get('/', (req, res) => {
    res.send('Welcome to Tour Management App!!');
});
app.use(globalErrorHandler_1.globalErrorHandler);
app.use(notFound_1.default);
exports.default = app;
