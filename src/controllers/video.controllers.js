import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, delFromCloudinary } from "../utils/cloudinary.js";
import { json } from "express";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userid } = req.query;
  //TODO : get all videos based on query, sort, pagination
  const pipeline = [];
  if (query) {
    pipeline.push({
      $search: {
        index: "default",
        text: {
          query: query,
          path: ["title", "description"],
        },
      },
    });
  }
  if (userid) {
    if (!isValidObjectId(userid)) {
      throw new ApiError(400, "Invalid userId");
    }
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userid),
      },
    });
  }
  // fetch videos only that are set isPublished true
  pipeline.push({
    $match: {
      isPublished: true,
    },
  });
  if (sortBy && sortType) {
    pipeline.push({
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    });
  } else {
    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });
  }
  console.log(pipeline);
  const videoAggregate = Video.aggregate(pipeline);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };
  const video = await Video.aggregatePaginate(videoAggregate, options);
  console.log("video is", video);

  res
    .status(200)
    .json(new ApiResponse(200, video, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished = true } = req.body;
  // get video, upload to cloudinary, create video
  // get title description from frontend
  // check title and description are not empty fields
  // make local path of video and thumbnail
  // upload it on cloudinary
  // create video object in database
  // response to client
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  //console.log(req.files);
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }
  const videoLocalPath = req.files?.videoFile[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "video file is required");
  }

  const thumbnail = await uploadOnCloudinary(
    thumbnailLocalPath,
    process.env.THUMBNAIL_FOLDER_NAME
  );
  if (!thumbnail) {
    throw new ApiError(500, "Error while uploading thumbnail");
  }
  const videoFile = await uploadOnCloudinary(
    videoLocalPath,
    process.env.VIDEOS_FOLDER_NAME
  );
  if (!videoFile) {
    throw new ApiError(500, "Error while uploading video file");
  }

  const video = await Video.create({
    videoFile: { publicId: videoFile?.public_id, url: videoFile?.url },
    thumbnail: { publicId: thumbnail?.public_id, url: thumbnail?.url },
    title: title.trim(),
    description: description.trim(),
    owner: req.user?._id,
    duration: Math.round(videoFile.duration),
    isPublished,
  });
  if (!video) {
    throw new ApiError(500, "Something went wrong while publishing video");
  }

  res
    .status(200)
    .json(new ApiResponse(200, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }
  // get video by id
  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribersCount: {
                $size: "$subscribers",
              },
              isSubscribed: {
                $cond: {
                  if: {
                    $in: [req.user?._id, "$subscribers.subscriber"],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              subscribersCount: 1,
              isSubscribed: 1,
            },
          },
        ],
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
        owner: {
          $first: "$owner",
        },
        isLiked: {
          $cond: {
            if: {
              $in: [req.user?._id, "$likes.likedBy"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        videoFile: 1,
        title: 1,
        thumbnail: 1,
        description: 1,
        views: 1,
        likesCount: 1,
        owner: 1,
        isLiked: 1,
      },
    },
  ]);
  if (!video) {
    throw new ApiError(500, " Something went wrong while fetching the video");
  }

  // if video object fetched successfully then update the view
  if (video) {
    await Video.findByIdAndUpdate(videoId, {
      $inc: {
        views: 1,
      },
    });
  }
  // if vieofetched succssfully set to watch history
  if (video) {
    await User.findByIdAndUpdate(req.user?._id, {
      $addToSet: {
        watchHistory: videoId,
      },
    });
  }

  //console.log(video);
  res
    .status(200)
    .json(new ApiResponse(200, video[0], "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description, isPublished } = req.body;
  // update video details
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  if ([title, description, isPublished].some((field) => field.trime() === "")) {
    throw new ApiError(
      400,
      "All fields i.e title and description are required"
    );
  }
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner?.toString() !== req.user?._id) {
    throw new ApiError(400, "Unauthorized request of editing video");
  }
  const thumbnailLocalPath = req.file?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }
  const thumbnail = await uploadOnCloudinary(
    thumbnailLocalPath,
    process.env.THUMBNAIL_FOLDER_NAME
  );
  const thumbnailToDelete = video.thumbnail?.public_id;

  if (!thumbnail) {
    throw new ApiError(400, "thumbnail not found");
  }

  const updateVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        isPublished,
        thumbnail: {
          publicId: thumbnail.public_id,
          url: thumbnail.url,
        },
      },
    },
    {
      new: true,
    }
  );
  if (!updateVideo) {
    throw new ApiError(500, "Failed to update the video please try again");
  }
  if (updateVideo) {
    await delFromCloudinary(
      thumbnailToDelete,
      process.env.THUMBNAIL_FOLDER_NAME
    );
  }
  res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "Video updated Succesfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // check valid video Id if not throw error
  // verify user is authorized if not throw error
  // req db for document and delete from db
  // delete from cloudnary
  // send res to client
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Inavlid video Id");
  }
  const video = await Video.findById(videoId);
  const videoToDelete = video.videoFile?.publicId;
  if (video.owner?._id !== req.user?._id) {
    throw new ApiError(400, "User is not auhtorized to delete the video");
  }
  const videoDeleted = await Video.findByIdAndDelete(video._id);
  if (!videoDeleted) {
    throw new ApiError(500, "Video not deleted please try again");
  }
  if (videoDeleted) {
    await delFromCloudinary(videoToDelete, process.env.VIDEOS_FOLDER_NAME);
  }
  res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // check is video id is vlid object id other wise throw error
  // req video document from db on base of of id if not thro error
  // check login user is authorized if not throw error
  // find and update update video.isPublished !=isPublished
  // send updated isPublished status response to client
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  // step 3
  if (video.owner.toString() !== req.user?._id) {
    throw new ApiError(400, "Unauthorized request, user cant update video");
  }
  const toggledVideoPublish = Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    {
      new: true,
    }
  );
  if (!toggledVideoPublish) {
    throw new ApiError(500, "Failed to toggle publish status");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isPublished: toggledVideoPublish.isPublished },
        "Video publish toggled successfully"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
