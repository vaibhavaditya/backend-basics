import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js"
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                _id : 1,
                content: 1,
                createdAt: 1,
                likecount: {$size: "$likes"},
                owner: {
                    _id: "$owner._id",
                    username: "$owner.username",
                    avatar: "$owner.avatar"
                }
            }
        }
    ])
    // const comments = await Comment.find({ video: videoId });
    if(comments.length === 0){
        throw new ApiError(401,"No comments available");
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200,comments,"All the comments"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const {videoId} = req.params;
    const {content} = req.body;
    if(!videoId){
        throw new ApiError(401,"Video id isnt mentioned")
    }
    else if(!content){
        throw new ApiError(401,"Cant post a comment without any data")
    }

    const videoFound = await Video.findById(videoId);
    if(!videoFound){
        throw new ApiError(403,"Video isnt available")
    }

    const comment = await Comment.create({
        content,
        video: videoFound._id,
        owner: videoFound.owner
    })

    if(!comment){
        throw new ApiError(501,"Cant post thee comment please try again")
    }
    
    return res
    .status(201)
    .json(new ApiResponse(201,comment,"Comment posted successfully"))
    
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    
    const {newContent} = req.body;

    const comment = req.resource

    comment.content = newContent;
    await comment.save({validateBeforeSave:true})
    
    return res
    .status(201)
    .json(new ApiResponse(201,comment,"Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const comment = req.resource 

    await comment.deleteOne()
    
    return res
    .status(201)
    .json(new ApiResponse(201,comment,"Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
