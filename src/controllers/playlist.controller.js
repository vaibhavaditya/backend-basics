import mongoose, {isValidObjectId} from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name){
        throw new ApiError(401,"Name is required to create a playlist")
    }
    // if(description === null){
    //     description = ""
    // }
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })
    
    if(!playlist){
        throw new ApiError(501,"Cannot create a playlist please try again")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist created Succesfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from : "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
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
                    }
                ]
            }
        },
        {
            $sort: {createdAt: -1}
        },
        {
            $project: {
                name: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                videos: {
                    $map:{
                        input: "$videos",
                        as: "video",
                        in: {
                            _id: "$$video._id",
                            title: "$$video.title",
                            thumbnail: "$$video.thumbnail",
                            views: "$$video.views",
                            duration: "$$video.duration",
                            isPublished: "$$video.isPublished",
                            owner: {
                                _id: "$$video.owner._id",
                                username: "$$video.owner.username",
                                avatar: "$$video.owner.avatar",
                                fullName: "$$video.owner.fullName"
                            }
                        }
                    }
                }
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,playlists,"All the playlist"))

})

const getPlaylistById = asyncHandler(async (req, res) => {
    
    const playlist = req.resource
    
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Fetched playlist successfullly"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"invalid playlistId or videoId")
    }
    
    const playlist = req.resource    

    const existedVideo = playlist.videos.some((id)=>id.toString() === videoId.toString())
    if(existedVideo){
        throw new ApiError(402,"Video already exist")
    }
    
    playlist.videos.push(videoId);
    await playlist.save();

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Video Added Succesfully"));

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(401,"invalid playlistId or videoId")
    }
    
    const playlist = req.resource
    
    const existedVideo = playlist.videos.some((id)=>id.toString() === videoId.toString())
    
    if(!existedVideo){
        throw new ApiError(402,"Video dosent exist")
    }

    playlist.videos.pull(videoId);
    await playlist.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Video deleted Succesfully"));
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const playlist = req.resource

    await playlist.deleteOne();
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Deleted playlist successfullly"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    
    if(!name){
        throw new ApiError(402,"Need a name to create a playlist") 
    }

    const playlist = req.resource;

    playlist.name = name || playlist.name
    playlist.description = description || playlist.description
    
    await playlist.save()

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Successfully updated playlist"))
})

export{
    createPlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist
}