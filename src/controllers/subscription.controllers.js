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
    $and: [
      { subscriber: new mongoose.Types.ObjectId(req.user?._id) },
      { channel: new mongoose.Types.ObjectId(channelId) },
    ],
  });
  console.log(typeof isSubscribed);
  if (!isSubscribed) {
    const subscription = await Subscription.create({
      subscriber: new mongoose.Types.ObjectId(req.user?._id),
      channel: new mongoose.Types.ObjectId(channelId),
    });
    console.log(subscription);
    if (!subscription) {
      throw new ApiError(
        500,
        "Something went wrong while toggling subscription"
      );
    } else {
      await Subscription.findByIdAndDelete(isSubscribed._id);
    }
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Toggling subscription created successfully")
    );
});

// controller to get subsribers list of channel
const getUserChannelSubscribers = asyncHandler(async () => {
  const { channelId } = req.params;
});

// controller to return channels list to which user has subscribed

const getSubscribedChannels = asyncHandler(async () => {
  const { subscriberId } = req.params;
});
export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
