import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
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

  const { username, email, fullName, password } = req.body;
  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const emailValidation = !email?.includes("@");
  if (emailValidation) {
    throw new ApiError(400, "Email is not correct");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "Username or Email already exists");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError("409", "Avatar file is required");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select("-password -refreshToken")
  if (!createdUser) {
    throw new ApiError(500,"Something went wrong while registering the user")
  }
  return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registered Successfully")
  )
});

export { registerUser };
