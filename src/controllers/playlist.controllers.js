import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

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
  res
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
  const updatedPlaylist = await Playlist.findByIdAndUpdate(playlist?._id, 
    {
    $set: {
      name,
      description,
    },
  },
  {
    new: true
  }
  );
  if (!updatedPlaylist) {
    throw new ApiError(500, "Playlist not updated please try again");
  }
  res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Plylist updated successfully"));
});

const deletePlaylist = asyncHandler( async(req,res )=>{
    const {playlistId} = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400,"Invalid playlist id")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404,"Playlist not found")
    }
    if (playlist.owner?._id.toString() !== req.user?._id.toString()) {
        throw new ApiError(400,"User is not authorized to delete the playlist")
    }

    await Playlist.findByIdAndDelete(playlist?._id)
res
.status(200)
.json( new ApiResponse(200,{},"Playlist deleted successfully") )
} )

export { createPlaylist, createPlaylist,deletePlaylist };
