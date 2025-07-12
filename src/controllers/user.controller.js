import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Playlist } from "../models/playlist.model.js";
import { Like } from "../models/like.model.js";


const generateAccessAndRefershTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})
    
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating the tokens")
    }
}

const registerUser = asyncHandler( async (req,res)=>{
    const {username, email, password, fullName} = req.body;
    if([username, email, password, fullName].some((feild)=> feild?.trim()) === ""){
        throw new ApiError(400, "All feilds are required")
    }

    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409, "User already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }

    if(!avatarLocalPath){
        throw ApiError(408, "Avatar file is required")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    }) 

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw ApiError(500, "Something went wrong while creating the year")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser, "User register successfully")
    )
})


const loginUser = asyncHandler(async (req,res)=>{
    const {username, password, email} = req.body;
    if(!username && !email){
        throw new ApiError(400,"Username or email is required");
    }
    // const allUsers = await User.find();
    // console.log(allUsers);
    const user = await  User.findOne({
        $or: [{email}, {username}]
    })    
    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefershTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,
        {
            user: loggedInUser, accessToken, refreshToken 
        },
        "User logged in successfully"
    ))
})

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findOneAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 //removes the field from the documnnet 
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{},"User logged out successfully"))
})

const refreshAcessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unarthorised request")
    }

    try {
        const decodeToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodeToken?._id);
        if(!user){
            throw new ApiError(402,"Invalid Refresh Token");
        }
    
        const {accessToken,newRefreshToken} = await generateAccessAndRefershTokens(user._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                201,
                {
                    accessToken: accessToken,
                    refreshToken: newRefreshToken
                },
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token" )
    }
})

const changeCurrentPassword = asyncHandler(async (req,res)=>{
    const {oldPassword, newPassword} = req.body

    if(!oldPassword || !newPassword){
        throw new ApiError(401,"Both the parameters are required")
    }

    const user = req.resouce
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordValid){
        throw new ApiError(403, "Invalid password given by user")
    }
    user.password = newPassword;
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json( new ApiResponse(201,{},"Password changed"));
})

const getCurrentUser = asyncHandler(async (req,res)=>{
    return res
    .status(200)
    .json( new ApiResponse(201,req.user,"Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req,res)=>{
    const {fullName, email, password} = req.body

    if((!fullName && !email) ||  !password){
        throw new ApiError(401,"Required feilds are not provided");
    }

    const user = req.resouce

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(402,"Invalid credentials")
    }

    user.fullName = fullName || user.fullName
    user.email = email || user.email
    await user.save({validateBeforeSave : false})
    user.password = undefined

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Credentials updated"))
})

const updateAvatarImage = asyncHandler(async (req,res)=>{
    const avatarLocalPath = req.file?.path; 

    if(!avatarLocalPath){
        throw new ApiError(402,"Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400,"Error in uploading it to cloudinary")
    }

     const user = req.resouce
    
    user.avatar = avatar.url
    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Avatar image changed successfully"));
})

const updateCoverImage = asyncHandler(async (req,res)=>{
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath){
        throw new ApiError(402,"Cover image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(400,"Error in uploading it to cloudinary")
    }

    const user = req.resouce
    
    user.coverImage = coverImage.url
    await user.save({validateBeforeSave : false})    

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Cover image changed successfully"));
})

const getUserChannelProfile = asyncHandler(async (req,res)=>{
    const {username} = req.params;

    if(!username){
        throw new ApiError(401,"Username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                suscribersCount: {
                    $size: "$subscribers"
                },
                chanelSuscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSuscribed: {
                    $cond: {
                        if: {$in : [req.user?._id,"$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                suscribersCount: 1,
                chanelSuscribedToCount: 1,
                isSuscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(403,"Channel does not exist");
    }

    return res
    .status(402)
    .json(new ApiResponse(201,channel[0],"Channel fetched successfully"))
})

const getWatchHistory = asyncHandler(async (req,res)=>{
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "user",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project:{
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
                
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(201,user[0].watchHistory,"Watch history fetched successfully"));
})

const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    await Subscription.deleteMany({
        $or: [
            { channel: userId },
            { subscriber: userId }
        ]
    });

    await Video.deleteMany({ owner: userId });

    await Tweet.deleteMany({ owner: userId });

    await Playlist.deleteMany({ owner: userId });

    await Like.deleteMany({ likedBy: userId });

    await Comment.deleteMany({ owner: userId})
    await req.user.deleteOne();

    res.status(200).json(new ApiResponse(200, {}, "User and all related data deleted"));
});
export 
{
    registerUser,
    loginUser,
    logoutUser,
    refreshAcessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatarImage,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    deleteUser
}