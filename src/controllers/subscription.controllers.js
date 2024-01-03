import { Subscription } from "../models/subscription.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";


const subscription = asyncHandler( async(req,res)=> {
    const subscribers = Subscription.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id) 
            }
        }
    ])
} )
