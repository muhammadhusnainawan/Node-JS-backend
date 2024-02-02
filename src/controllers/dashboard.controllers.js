import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import {Subscription} from "../models/subscription.models.js"
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
            $sum: 1
      },
    }
}
  ]);

  const subscribers = await Subscription.aggregate(
    [
        {
            $match:{
                channel: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group:{
                _id:null,
                subscribersCount:{
                    $sum:1
                }
            }
        }
    ]
  )

  const channelStats = {
    subscribers: subscribers[0]?.subscribersCount || 0,
    totalLikes: video[0]?.totalLikes || 0,
    totalViews: video[0]?.totalViews || 0,
    totalVideos: video[0]?.totalVideos || 0
};
  res
    .status(200)
    .json(
      new ApiResponse(200, channelStats, "channel stats fetched successfully")
    );
});

export { getChannelStats };
