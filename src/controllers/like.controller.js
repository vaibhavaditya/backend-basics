import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId  = req.user._id
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)){
        throw new ApiError(403,"Invalid video ID")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    })

    if(existingLike){
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, {}, "Video unliked"));
    }

    await Like.create({
        video: videoId,
        likedBy: userId
    })

   return res.status(201).json(new ApiResponse(201, {}, "Video liked"));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId  = req.user._id

    if(!isValidObjectId(commentId)){
        throw new ApiError(403,"Invalid video ID")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    if(existingLike){
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, {}, "Comment unliked"));
    }

    await Like.create({
        comment: commentId,
        likedBy: userId
    })

   return res.status(201).json(new ApiResponse(201, {}, "Comment liked"));
})


const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId  = req.user._id

    if(!isValidObjectId(commentId)){
        throw new ApiError(403,"Invalid video ID")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })

    if(existingLike){
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, {}, "Tweet unliked"));
    }

    await Like.create({
        tweet: tweetId,
        likedBy: userId
    })

   return res.status(201).json(new ApiResponse(201, {}, "Tweet liked"));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user._id
    
    const likedVideos = await Like.find({
        likedBy: userId,
        video: {$ne: null}
    }).select("video");
    
    return res
    .status(201)
    .json(new ApiResponse(201,likedVideos,"Videos liked by user"))
})

export {
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getLikedVideos
}