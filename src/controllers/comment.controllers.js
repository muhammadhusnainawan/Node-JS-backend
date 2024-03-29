import { Comment } from "../models/comment.models.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getVideoComments = asyncHandler(async (req, res) => {
  // get all comment of a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const commentaggregate = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
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
        from: "likes",
        localField: "_id",
        foreignField: "comment",
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
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        owner: {
          username: 1,
          avatar: 1,
        },
        likesCount: 1,
        isLiked: 1,
      },
    },
  ]);
  if (!commentaggregate) {
    throw new ApiError(500, " Comment not found try again");
  }
  console.log(commentaggregate[0]);
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };
  const comments = await Comment.aggregatePaginate(
    commentaggregate[0],
    options
  );
  res
    .status(200)
    .json(
      new ApiResponse(200, comments, "Video comments fetched successfully")
    );
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }
  const { content } = req.body;
  if (content === "") {
    throw new ApiError(400, "Content is required");
  }

  const comment = await Comment.create({
    content,
    video: new mongoose.Types.ObjectId(videoId),
    owner: new mongoose.Types.ObjectId(req.user?._id),
  });
  if (!comment) {
    throw new ApiError(500, "Comment is not posted please try again");
  }
  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (content == "") {
    throw new ApiError(400, "Cotent is required");
  }
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }
  if (comment?.owner?._id.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "user is not authorized to update comment");
  }
  const updatedComment = await Comment.findbyIdAndUpdate(
    comment?._id,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedComment) {
    throw new ApiError(500, "Comment not updated please try again");
  }
  res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler( async(req,res)=>{
    const {commentId} = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment id")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(500, "Comment not found")
    }
    if (comment?.owner?._id.toString() !== req?.user?._id.toString()) {
        throw new ApiError("400", "User is not authorized to delete the comment")
    }
    const deletedComment = await Comment.findByIdAndDelete(comment?._id)
    res
    .status(200)
    .json( new ApiResponse(200, {}, "Comment deleted successfully") )
} )

export { getVideoComments, addComment,updateComment,deleteComment };
