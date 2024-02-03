import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const healthCheck = asyncHandler( async(req,res)=>{

    res
        .status(200)
        .json( new ApiResponse(200,{message:"Everything is O.K"},"Ok"  ) )
} )


export {healthCheck}