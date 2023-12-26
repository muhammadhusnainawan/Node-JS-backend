import {asyncHandler} from "../utils/asyncHandler.js"

const registerUser = asyncHandler (async(req,res) => {
// get user details from frontend
// validations i.e all fields are properly filled, not empty fields, email is in proper format
// check user is not already exists by email or username
// check if files are available i.e images and avatar or not must check avatar
// upload them to cloudinary specially avatar
// check if on cloudinary images are uploaded successfully
// create user object-- create entry in database
// remove password and refresh token from response
// check for user creation
// return response

const {username,email,fullName}  = req.body
console.log("username,email,fullName are", username,email,fullName);

})

export {registerUser}