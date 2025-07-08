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

    if(!newContent){
        throw new ApiError(401,"No content is provided")
    }

    const tweet = req.resource

    tweet.content = newContent;
    await tweet.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"Tweet is Updated"))
    
})

const deleteTweet = asyncHandler(async (req, res) => {
    // TODO: delete tweet 
    const tweet = req.resource;

    await tweet.deleteOne();
    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet is deleted"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10, sortBy="createdAt"} = req.query
    const sortStage = {};
    sortStage[sortBy] = 1;
    const skip = (Number(page)-1) * Number(limit)

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
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                fullName: 1,
                                username: 1,
                                avatar: 1
                            }
                        }
                    ]                
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
                    owner: 1
                }
            },
            {$sort: sortStage},
            {$skip: skip},
            {$limit: Number(limit)}
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