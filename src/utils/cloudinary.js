import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// console.log("process is",process.env);
const uploadOnCloudinary = async (localFilePath, folderName) => {
  try {
    if (!localFilePath) return null;
    // upload on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: folderName,
    });
    // file has been uploaded successfully
    console.log("file is uploaded on cloudinary", response);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    console.log("error in cloudinary", error);
    return null;
  }
};

const deleteFromCloudinary = async (id,resource_type) => {
  try {
    if (!id && resource_type) return null;
    const response = await cloudinary.api.delete_resources([id], {
      type: "upload",
      resource_type: resource_type
    });
    return response
  } catch (error) {
    console.log(error);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
