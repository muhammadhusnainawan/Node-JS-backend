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
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "channel id is required");
  }
  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "userdetails",
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        avatar: 1,
      },
    },
  ]);
  console.log(subscribers);
  res
    .status(200)
    .json(new ApiResponse(200, subscribers[0], "List of channel subscribers"));
});

// controller to return channels list to which user has subscribed

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
});
export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
