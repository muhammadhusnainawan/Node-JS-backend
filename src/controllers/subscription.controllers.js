import { Subscription } from "../models/subscription.models.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// controller to return subscriber list of a channel

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "Channel Id not found")
  }
  const channels = await User.findById( channelId );

  return res
    .status(200)
    .json(new ApiResponse(200, channels, "List of channels fetched"));
});

export { getUserChannelSubscribers };
