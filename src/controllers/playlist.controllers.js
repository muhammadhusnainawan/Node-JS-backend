import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (name === "" || description === "") {
    throw new ApiError(400, "Name and description is required");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: new mongoose.Types.ObjectId(req.user?._id),
  });
  if (!playlist) {
    throw new ApiError(500, "Playlist not created please try again");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  const { name, description } = req.body;
  if (name === "" || description === "") {
    throw new ApiError(404, "Name and description is required");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }
  if (playlist.owner?._id.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "User is not authorized to update playlist");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlist?._id,
    {
      $set: {
        name,
        description,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedPlaylist) {
    throw new ApiError(500, "Playlist not updated please try again");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Plylist updated successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  if (playlist.owner?._id.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "User is not authorized to delete the playlist");
  }

  await Playlist.findByIdAndDelete(playlist?._id);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist id or video id");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  const video = await Video.findById(videoId);
  if (!video || !video?.isPublished) {
    throw new ApiError(404, "Video not found");
  }

  if (
    playlist.owner?._id.toString() &&
    video.owner?._id.toString() !== req.user?._id.toString()
  ) {
    throw new ApiError(400, "User is not auhtorized to add video to playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlist?._id,
    {
      $addToSet: {
        videos: new mongoose.Types.ObjectId(video?._id),
      },
    },
    {
      new: true,
    }
  );
  if (!updatedPlaylist) {
    throw new ApiError(500, "Video not added please try again");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video added successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  if (!isValidObjectId(videoId) || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid video Id or Invalid Playlist id");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist or video not found ");
  }
  if (!playlist?.videos.includes(videoId)) {
    throw new ApiError(400, "Video not found in playlist");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (
    playlist.owner?._id.toString() &&
    video.owner?._id.toString() !== req.user?._id.toString()
  ) {
    throw new ApiError(
      400,
      "User is not auhtorized to delete video to playlist"
    );
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlist?._id,
    {
      $pull: {
        videos: new mongoose.Types.ObjectId(video?._id),
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video removed successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $match: {
        isPublished: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$videos",
        },
        totalViews: {
          $sum: "$videos.views",
        },
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        totalVideos: 1,
        totalViews: 1,
        owner: {
          username: 1,
        },
        videos: {
          videoFile: 1,
          thumbnail: 1,
          title: 1,
          description: 1,
          views: 1,
          createdAt: 1,
        },
      },
    },
  ]);
  if (!playlist) {
    throw new ApiError(500, "Something went wrong while fetching playlist");
  }
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $addFields: {
        totalViews: {
          $sum: "$videos.views",
        },
        totalVideos: {
          $size: "$videos",
        },
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $project: {
        owner: {
          username: 1,
          fullName: 1,
        },
        totalVideos: 1,
        totalViews: 1,
        name: 1,
        description: 1,
        videos:{
          "thumbnail.url":1
        }
      },
    },
  ]);
  res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
});

export {
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getPlaylistById,
  getUserPlaylists,
};
