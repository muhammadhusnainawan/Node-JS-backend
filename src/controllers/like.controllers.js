import mongoose, { isValidObjectId, mongo } from "mongoose";
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
    if (!videoLike) {
      throw new ApiError(400, "video is not liked try again");
    }
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

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  // check if comment id is a valid object id otherwise throw error
  // findOne document on the basis of comment id and user
  // if already liked the comment then find it and delete
  // if not liked the comment the create the document
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }
  const isCommentLiked = await Like.findOne({
    $and: [
      { comment: new mongoose.Types.ObjectId(commentId) },
      { likedBy: new mongoose.Types.ObjectId(req.user?._id) },
    ],
  });
  let like;
  if (isCommentLiked) {
    await Like.findByIdAndDelete(isCommentLiked?._id);
    like = false;
  } else {
    const commentLike = await Like.create({
      comment: new mongoose.Types.ObjectId(commentId),
      likedBy: new mongoose.Types.ObjectId(req.user?._id),
    });
    if (!commentId) {
      throw new ApiError(400, "comment is not liked please try again");
    }
    like = true;
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        like ? "comment is liked by user" : "comment is unliked by user"
      )
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }
  const isTweetLiked = await Like.findOne({
    $and: [
      { tweet: new mongoose.Types.ObjectId(tweetId) },
      { likedBy: new mongoose.Types.ObjectId(req.user?._id) },
    ],
  });
  let like;
  if (isTweetLiked) {
    await Like.findByIdAndDelete(isTweetLiked?._id);
    like = false;
  } else {
    const tweetLiked = await Like.create({
      tweet: new mongoose.Types.ObjectId(tweetId),
      likedBy: new mongoose.Types.ObjectId(req.user?._id),
    });
    if (!tweetLiked) {
      throw new ApiError(500, "Tweet is not liked Please try again");
    }
    like = true;
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        like ? "Tweet liked successfully" : "Tweet unliked successfully"
      )
    );
});

export { toggleVideoLike, toggleCommentLike,toggleTweetLike };
