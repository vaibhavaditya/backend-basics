import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Tweet} from "../models/tweet.model.js"
import mongoose, { isValidObjectId } from "mongoose"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    if(!content){
        throw new ApiError(401,"No content is provided")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })

    if(!tweet){
        throw new ApiError(501,"Cannot post this tweet please try again")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"Tweet posted"));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {newContent} = req.body
    const {tweetId} = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(402,"Tweet Id isnt valid")
    }

    if(!newContent){
        throw new ApiError(401,"No content is provided")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(403,"No tweet present to update")
    }

    if(tweet.owner.toString !== req.user._id){
        throw new ApiError(405,"Only owner can edit his tweet")
    }


    tweet.content = newContent;
    await tweet.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"Tweet is Updated"))
    
})

const deleteTweet = asyncHandler(async (req, res) => {
    // TODO: delete tweet
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(402, "Tweet Id isn't valid");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(403, "No tweet present to delete");
    }

    if(tweet.owner.toString !== req.user._id){
        throw new ApiError(405,"Only owner can edit his tweet")
    }

    await tweet.deleteOne();
    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet is deleted"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const tweetsByUser = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "tweetsLiked"
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
                _id: 1,
                content: 1,
                createdAt: 1,
                likeCount: {$size: "$tweetsLiked"},
                owner: {
                    _id: "$owner._id",
                    username: "$owner.username",
                    avatar: "$owner.avatar"
                }
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,tweetsByUser,"Tweets posted by user"))
})

export{
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets
}