import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadTestCaseFileToCloudinary = async (filePath) => {
    try{
        if(!filePath) {
            return null;
        }

        const response = await cloudinary.uploader.upload(filePath,{
            resourceType: "raw",
        })
        
        console.log("Response from Cloudinary:", response);

        // fs.unlinkSync(filePath); 

        return response;
    } catch (error) {
        if (filePath) {
            fs.unlinkSync(filePath);
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

export { uploadTestCaseFileToCloudinary , uploadImageToCloudinary };