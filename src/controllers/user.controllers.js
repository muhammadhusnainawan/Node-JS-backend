import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findOne(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating token");
  }
};

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
  console.log(avatarLocalPath);
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log(avatar);
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
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async () => {
  // receve data from user i.e username, email, password
  //check if email and user name is provided
  // find user from db from email and password
  // if user not found throw error
  // validate password
  // generate access and refesh tokens
  // send cookies
  // send response

  const { email, username, password } = req.body;
  if (!email && !username) {
    throw new ApiError(400, "email or username is required");
  }
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new ApiError(404, "User not exists");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "User credentials are not valid");
  }
  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user_id);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // delete refresh token
  // clear cookies
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out successfully"));
});

export { registerUser, loginUser, logoutUser };
