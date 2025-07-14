/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { UserServices } from "./user.service";


const createUser = async (req: Request, res: Response) => {
    try {
        const user = await UserServices.createUser(req.body);
        res.status(201).json({
            message: "User created successfully",
            user
        })
    } catch (error: any) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
};

export const UserControllers = {
    createUser
};


// controllers <-- services <-- models <-- model <-- db