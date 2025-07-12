import dotenv from 'dotenv'
dotenv.config({path: './.env'});
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    // console.log(process.env.CLOUDINARY_CLOUD_NAME);
    
    try {
        
        if(!localFilePath) return null;
        //upload the file on clodinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has beem uploaded successfully
        // console.log("file is uloaded on clodinary: ", response.url);
        fs.unlinkSync(localFilePath);
        return response
    } catch (error) {
        console.log("Cloudinary upload", error);
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export { uploadOnCloudinary }
    
    