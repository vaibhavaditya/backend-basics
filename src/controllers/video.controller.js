    import { asyncHandler } from "../utils/asyncHandler.js";
    import { ApiError } from "../utils/ApiError.js";
    import { ApiResponse } from "../utils/ApiResponse.js";
    import { Video } from "../models/video.model.js";
    import { uploadOnCloudinary } from "../utils/cloudinary.js";
    import mongoose from "mongoose";

    const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc", query = "", userId = "" } = req.query;

    const matchStage = {};
    if (query) {
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    if (userId) {
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    const sortStage = {};
    sortStage[sortBy] = sortType === "asc" ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);

    const result = await Video.aggregate([
        {
            $match: matchStage
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
            $unwind: {
                path: "$owner",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $facet: {
                videos: [
                    { $sort: sortStage },
                    { $skip: skip },
                    { $limit: Number(limit) }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        }
    ]);

    const videos = result[0]?.videos || [];
    const total = result[0]?.totalCount[0]?.count || 0;

    return res.status(200).json(
        new ApiResponse(200, {
            videos,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalResults: total
        }, "Videos fetched successfully")
    );
});


    const publishAVideo = asyncHandler(async (req,res)=>{
        const {title, description} = req.body
        const VideoLocalPath = req.files?.videoFile?.[0]?.path;
        const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path; 
        if(!title || !description || !VideoLocalPath || !thumbnailLocalPath){
            throw new ApiError(402, "All Values are required for posting a video")
        }

        const videoFile = await uploadOnCloudinary(VideoLocalPath);
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);    
        
        if(!videoFile.url || !thumbnail.url){
            throw new ApiError(403, "Files havent been uploaded to clodinary")
        }
        const video = await Video.create({
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            title,
            description,
            duration : videoFile?.duration,
            owner: req.user._id,    
        })

        
        return res
        .status(200)
        .json( new ApiResponse(200,video, "Video published successfully"));
    }) 

    const getVideoById = asyncHandler(async (req,res)=>{
        const { videoId } = req.params
        
        if(!videoId){
            throw new ApiError(402,"Video id isnt provided")
        }

        const video = await Video.findById(videoId);

        if(!video){
            throw new ApiError(403,"No video exist")
        }

        return res
        .status(201)
        .json(new ApiResponse(201,video,"Video fetched succesfully"));
    })

    const deleteVideo = asyncHandler(async (req,res)=>{
        const { videoId } = req.params
        
        if(!videoId){
            throw new ApiError(402,"Video id isnt provided")
        }

        const video = await Video.findByIdAndDelete(videoId);

        if(!video){
            throw new ApiError(403,"No video existed to delete")
        }

        return res
        .status(201)
        .json(new ApiResponse(201,video,"Video deleted succesfully"));
    })

    const updateVideo = asyncHandler(async (req,res)=>{
        const newThumbnailPath = req.file?.path
        const { videoId } = req.params
        if(!newThumbnailPath){
            throw new ApiError(402,"New thumbnail is provided")
        }

        if(!videoId){
            throw new ApiError(402,"videoId isnt provided")
        }

        const newthumbnail = uploadOnCloudinary(newThumbnailPath);

        if(newthumbnail.url){
            throw new ApiError(403,"Cannot be uploaded to clodinary")
        }

        
        const video = await Video.findById(videoId)
        
        if(!video){
            throw new ApiError(403,"No video exist")
        }

        video.thumbnail = newthumbnail.url;
        await video.save({validateBeforeSave : false})
        
        if(!video){
            throw new ApiError(404,"video cannot be formed")
        }
        return res
        .status(201)
        .json(new ApiResponse(201,video,"Video fetched succesfully"));
    })

    const togglePublishStatus = asyncHandler(async (req,res)=>{
        const { videoId } = req.params;
        if(!videoId){
            throw new ApiError(402,"Video id isnt provided")
        }

        const video = await Video.findById(videoId)

        if(!video){
            throw new ApiError(403,"No video exist")
        }

        video.isPublished = !video.isPublished;
        await video.save({validateBeforeSave : false});

        return res
        .status(202)
        .json(new ApiResponse(202,video,"Video toggled succesfully"));

    })
    export {
        getAllVideos,
        publishAVideo,
        getVideoById,
        deleteVideo,
        updateVideo,
        togglePublishStatus

    }