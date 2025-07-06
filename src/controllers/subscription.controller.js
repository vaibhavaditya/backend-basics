import mongoose,{isValidObjectId} from "mongoose";
import { Subscription } from "../models/subscription.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    if(!isValidObjectId(channelId)){
        throw new ApiError(401,"Inavlid Channel id");
    }
    const subscribed = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if(subscribed){
        await subscribed.deleteOne()
        return res.status(200).json(new ApiResponse(200,subscribed,"Channel unsubscribed"))
    }

    const newSubscriber = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    })
    return res.status(200).json(new ApiResponse(200,newSubscriber,"Channel subscribed"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    console.log(channelId);
    
    if(!isValidObjectId(channelId)){
        throw new ApiError(401,"Inavlid Channel id");
    }
    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as : "subscriberDetails"
            }
        },
        {
            $unwind: "$subscriberDetails"
        },
        {
            $replaceRoot: {
                newRoot: "$subscriberDetails"
            }
        },
        {
            $project:{
                _id: 1,
                username: 1,
                fullName: 1,
                // subscriberCount: {$size: "$subscriberDetails"}
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,subscribers,"All the subsribers"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(401,"Inavlid subscriber id");
    }

    const channelsSubscribed = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelsSubscribedDetails"
            }
        },
        {
            $unwind: "$channelsSubscribedDetails"
        },
        {
            $replaceRoot: {
                newRoot: "$channelsSubscribedDetails"
            }
        },
        {
            $project:{
                _id: 1,
                username: 1,
                // channelsSubscribed: {$size: "$channelsSubscribedDetails"}
            }
        }

    ])

    return res
    .status(200)
    .json(new ApiResponse(200,channelsSubscribed,"All the channels subscribed"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}