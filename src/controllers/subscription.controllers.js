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
  const isSubscribed = Subscription.findOne({
    $and: [{ subscriber: req.user?._id }, { channel: channelId }],
  });
  console.log(isSubscribed._id);
  if (isSubscribed) {
    await Subscription.findByIdAndDelete(isSubscribed?._id);
  } else {
    const subscriptio = await Subscription.create({
      subscriber: req.user?._id,
      channel: req.params._id,
    });
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Toggling subscription created successfully")
    );
});

// controller to get subsribers list of channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
});

// controller to return channels list to which user has subscribed

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
});
export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
