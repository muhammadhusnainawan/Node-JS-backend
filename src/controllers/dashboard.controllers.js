import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // get the channel stats like total videos, total subscribers, total views, total likes
  const userId = req.user?._id;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid channel Id");
  }
  const video = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        videoLikes: {
          $size: "$likes",
        },
      },
    },
    {
      $project: {
        videoLikes: 1,
        views: "$views",
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: {
          $sum: "$videoLikes",
        },
        totalViews: {
          $sum: "$views",
        },
        totalVideos: {
          $sum: 1,
        },
      },
    },
  ]);

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        subscribersCount: {
          $sum: 1,
        },
      },
    },
  ]);

  const channelStats = {
    subscribers: subscribers[0]?.subscribersCount || 0,
    totalLikes: video[0]?.totalLikes || 0,
    totalViews: video[0]?.totalViews || 0,
    totalVideos: video[0]?.totalVideos || 0,
  };
 return res
    .status(200)
    .json(
      new ApiResponse(200, channelStats, "channel stats fetched successfully")
    );
});

const getAllVideos = asyncHandler(async (req, res) => {
  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
      },
    },

    {
      $project: {
        _id: 1,
        "videoFile.url": 1,
        "thumbnail.url": 1,
        title: 1,
        description: 1,
        createdAt: 1,
        isPublished: 1,
        likesCount: 1,
      },
    },
  ]);
  if (!videos) {
    throw new ApiError(500,"Channel videos not fetched please try again")
  }
  return res
    .status(200)
    .json( new ApiResponse(200,videos,"Channel videos fetched successfully") )
});

export { getChannelStats,getAllVideos };
