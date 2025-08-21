/* eslint-disable @typescript-eslint/no-explicit-any */
// Frontend  -> Form Data with Image file -> multer -> Form Data -> Req (Body + File);

import { v2 as cloudinary } from "cloudinary";
import { envVars } from "./env";
import AppError from "../errorHelpers/AppError";
import stream from 'stream';

// Our folder -> image -> form data -> file -> multer -> nijer folder a rakhe(temporarily) -> Req.file

// req.file -> cloudinary(req.file) -> url -> mongoose -> mongodb te store hobe


cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET
});

export const cloudinaryUpload = cloudinary;

export const uploadBufferToCloudinary = async (buffer: Buffer, filename: string) => {
    try {
        return new Promise((resolve, reject) => {
            const public_id = `pdf/${filename}-${Date.now()}`;

            const bufferStream = new stream.PassThrough();
            bufferStream.end();

            cloudinary.uploader.upload_stream(
                {
                    resource_type: "auto",
                    public_id: public_id,
                    folder: "pdf"
                },
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(result);
                }
            ).end(buffer);

        })
    } catch (error: any) {
        console.log(error);
        throw new AppError(401, `Error uploading file ${error.message}`);
    }
};

export const deleteImageFromCloudinary = async (url: string) => {
    try {
        const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;

        const match = url.match(regex); // url er last a jpg,jpeg thakbe egolo khete baki gulo diye ekta array return korbe

        if (match && match[1]) {
            const public_id = match[1];
            await cloudinary.uploader.destroy(public_id);
            console.log(`File ${public_id} is deleted from cloudinary`);
        }
    } catch (error: any) {
        throw new AppError(401, "Cloudinary image deletion failed", error.message);
    }
}

// cloudinary.uploader.upload();

// uporer file upload er bishoy tar jonno amra ekta package use korbo,jathe amdr cloudinary er default function use korte na hoi and beshi difficult korte na hoi--- file name - multer-storage-cloudinary