import { Subscription } from "../models/subscription.models.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId.trim()) {
    throw new ApiError(400, "Channel id not found");
  }
  let channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(400, "Channel not found");
  }
  let subscriber = req.user;
  if (!subscriber) {
    throw new ApiError(400, "No logged in user found");
  }
  const alreadySubscriber = await Subscription.findOne({
    subscriber: subscriber?._id,
  });
  if (alreadySubscriber) {
    throw new ApiError(409, "User already subscribed the channel");
  }
  const subscription = await Subscription.create({
    subscriber,
    channel,
  }).select("+subscriber.username");
  if (!subscription) {
    throw new ApiError(500, "Error while subscribing the channel");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, subscription, "Subscription created successfully")
    );
});

export { toggleSubscription };
