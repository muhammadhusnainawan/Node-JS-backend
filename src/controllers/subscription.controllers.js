import { Subscription } from "../models/subscription.models.js";
import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId.trim()) {
    throw new ApiError(400, "Channel id not found");
  }
  console.log(channelId);
  const isSubscribed = await Subscription.findOne({
    $and: [
      { subscriber: new mongoose.Types.ObjectId(req.user?._id) },
      { channel: new mongoose.Types.ObjectId(channelId) },
    ],
  }).exec();
  console.log(isSubscribed);
  if (isSubscribed) {
    await Subscription.findByIdAndDelete(isSubscribed?._id);
  } else {
    const subscription = await Subscription.create({
      subscriber: new mongoose.Types.ObjectId(req.user?._id),
      channel: new mongoose.Types.ObjectId(channelId),
    });
    if (!subscription) {
      throw new ApiError(
        500,
        "Something went wrong while subscribing a chnnel"
      );
    }
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Toggling subscription created successfully")
    );
});

// controller to get subsribers list of channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  // count number of channels in which the user id exists
  const { subscriberId } = req.params;
  if (!subscriberId) {
    throw new ApiError(400, "channel id is required");
  }
  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribers",
      },
    },
    {
      $project: {
        "subscribers.username": 1,
        "subscribers.fullName": 1,
        "subscribers.avatar": 1,
      },
    },
  ]);
  //console.log(subscribers);
  if (!subscribers) {
    throw new ApiError(400, "Channel have not any subscriber");
  }
  res
    .status(200)
    .json(new ApiResponse(200, subscribers, "List of channel subscribers"));
});

// controller to return channels list to which user has subscribed

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  console.log(channelId);
  if (!channelId) {
    throw new ApiError(400, "Channel id is required");
  }
  const channels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channels",
      },
    },
    {
      $project: {
        "channels.username": 1,
        "channels.fullName": 1,
        "channels.avatar": 1,
      },
    },
  ]);
  if (!channels) {
    throw new ApiError(400, "User have not subscribeda ny channel");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channels,
        "user subscribed channels fetched successfully"
      )
    );
});
export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
