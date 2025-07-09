import express from 'express';
import mongoose from 'mongoose';
import app from './app';

let server;

const startServer = async () => {
    try {
        await mongoose.connect('mongodb+srv://ph-tour-management-app:ph-tour-management-app@cluster0.dospc0a.mongodb.net/tour-management-system?retryWrites=true&w=majority&appName=Cluster0');
        console.log('Connected to DB!!');
        server = app.listen(5000, () => {
            console.log('Server is running on port 5000');
        });
    } catch (error) {
        console.log(error);
    }
};

startServer();