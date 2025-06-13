import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadTestCaseFileToCloudinary = async (filePath) => {
    try {
        // console.log("File Path:", filePath);

        if (!filePath || !fs.existsSync(filePath)) {
            console.warn("Invalid file path.");
            return null;
        }

        // console.log("Uploading file to Cloudinary...");

        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "raw",
        });

        // console.log("Cloudinary upload successful:", response);

        // Clean up local file after upload
        await fs.promises.unlink(filePath);

        return response;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);

        if (filePath && fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
        }

        return null;
    }
}

const uploadImageToCloudinary = async (filePath) => {
    try {
        if (!filePath) {
            return null;
        }

        const response = await cloudinary.uploader.upload(filePath, {
            resourceType: "auto",
        });

        // fs.unlinkSync(filePath); 

        return response;
    } catch (error) {
        if (filePath) {
            fs.unlinkSync(filePath);
        }
        return null;
    }   
}

export { uploadTestCaseFileToCloudinary, uploadImageToCloudinary };