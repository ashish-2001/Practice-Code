import { v2 as cloudinary } from "cloudinary";

async function uploadImageToCloudinary(file, folder, height, quality){

    const options = { folder };

    if(options.height){
        options.height = height;
    };

    if(options.quality){
        options.quality = quality;
    };

    options.resource_type = "auto";

    return await cloudinary.uploader.upload(file.tempFilePath, options);

} 

export {
    uploadImageToCloudinary
}