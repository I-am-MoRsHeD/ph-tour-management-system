/* eslint-disable no-console */
import mongoose from 'mongoose';
import app from './app';
import { Server } from 'http';
import { envVars } from './config/env';

let server: Server;

const startServer = async () => {
    try {
        await mongoose.connect(envVars.DB_URL);
        console.log('Connected to DB!!');
        server = app.listen(5000, () => {
            console.log('Server is running on port 5000');
        });
    } catch (error) {
        console.log(error);
    }
};

startServer();

process.on('unhandledRejection', (err) => {
    console.log("Unhandled rejection is detected...Server is shutting down...!", err);
    if (server) {
        server.close(() => {
            process.exit(1);
        })
    };
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.log("Uncaught expection is detected...Server is shutting down...!", err);
    if (server) {
        server.close(() => {
            process.exit(1);
        })
    };
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log("SIGTERN signal is received...Server is shutting down...!");
    if (server) {
        server.close(() => {
            process.exit(1);
        })
    };
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