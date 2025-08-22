"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./app/config/env");
const seedSuperAdmin_1 = require("./app/utils/seedSuperAdmin");
const redis_config_1 = require("./app/config/redis.config");
let server;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(env_1.envVars.DB_URL);
        console.log('Connected to DB!!');
        server = app_1.default.listen(5000, () => {
            console.log('Server is running on port 5000');
        });
    }
    catch (error) {
        console.log(error);
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, redis_config_1.connectRedis)();
    yield startServer();
    yield (0, seedSuperAdmin_1.seedSuperAdmin)();
}))();
process.on('unhandledRejection', (err) => {
    console.log("Unhandled rejection is detected...Server is shutting down...!", err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    ;
    process.exit(1);
});
process.on('uncaughtException', (err) => {
    console.log("Uncaught expection is detected...Server is shutting down...!", err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    ;
    process.exit(1);
});
process.on('SIGTERM', () => {
    console.log("SIGTERN signal is received...Server is shutting down...!");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    ;
    process.exit(1);
});
/**
 * unhandled rejection error
// Promise.reject(new Error('There is something error happening'));

* uncaught rejection error
// throw new Error('There is something error happening');

* signal termination (sigterm)
// process.kill(process.pid, 'SIGTERM');
 */
/**
 * server error 3 bhabe hote pare-->
 * unhandled rejection error
 * uncaught rejection error
 * signal termination (sigterm)
 */ 
