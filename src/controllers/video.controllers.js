import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, delFromCloudinary } from "../utils/cloudinary.js";

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
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
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

const getVideoById = asyncHandler(async (req,res) => {
  const { videoId } = req.params;
  // get video by id
  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
   {
    $project:{
      "videoFile.url": 1
    }
   }
  ]);
  console.log(video);
  res
    .status(200)
    .json(new ApiResponse(200, video[0], "video fetched successfully"));
});

const updateVideo = asyncHandler(async () => {
  const { videoId } = req.params;
  // update video details
});

export { getAllVideos, publishAVideo, getVideoById, updateVideo };
