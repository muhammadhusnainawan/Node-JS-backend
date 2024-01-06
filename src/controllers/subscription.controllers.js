import { Subscription } from "../models/subscription.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const subscription = asyncHandler(async (req, res) => {
  const { username } = req.user?.username;

  if (username?.trim()) {
    throw new ApiError(400, "user not found");
  }
  const subscribers = await Subscription.aggregate([
   
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
      },
    },
     {
      $match: {
        username: username?.toLowerCase(),
      },
    },
  ]);

  const subscriptionDoc = await Subscription.create({
    subscribers: subscribers[0],
  });
  console.log( subscribers );

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscriptionDoc, "subscriber from user document")
    );
});

export { subscription };
