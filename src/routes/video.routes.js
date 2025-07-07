import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { publishAVideo,getVideoById,deleteVideo,updateVideo,togglePublishStatus, getAllVideos } from "../controllers/video.controller.js";
import { checkOwner } from "../middlewares/owner.middleware.js";
import { Video } from "../models/video.model.js";

const router = Router()
router.use(verifyJwt);


router.route('/')
.get(getAllVideos)
.post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        },
    ]),
    publishAVideo
)

router.route('/:videoId')
.get(getVideoById)
.delete(checkOwner(Video, "params.videoId"),deleteVideo)
.patch(upload.single('thumbnail'),checkOwner(Video, "params.videoId"),updateVideo)

router.route("/toggle/publish/:videoId").patch(checkOwner(Video, "params.videoId"),togglePublishStatus);

export default router