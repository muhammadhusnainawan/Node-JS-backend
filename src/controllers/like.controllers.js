import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // check video id is valid object id if not throw error
  //findone from likes documents on the basis of videoId and user id
  // if there is an already document then delete it otherwise add it
  // send empty object as a response
  if (!isValidObjectId(videoId.trim())) {
    throw new ApiError(400, "Invalid video Id");
  }
  const isLiked = await Like.findOne({
    $and: [
      { video: new mongoose.Types.ObjectId(videoId) },
      { likedBy: new mongoose.Types.ObjectId(req.user?._id) },
    ],
  });
  let like;
  if (isLiked) {
    await Like.findByIdAndDelete(isLiked._id);
    like = false;
  } else {
    const videoLike = await Like.create({
      video: new mongoose.Types.ObjectId(videoId),
      likedBy: new mongoose.Types.ObjectId(req.user?._id),
    });
    like = true;
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        like
          ? "User liked the video successfully"
          : "User unlike the video successfully"
      )
    );
});

export { toggleVideoLike };
