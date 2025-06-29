import { Router } from "express";
import { logoutUser, loginUser,registerUser, refreshAcessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatarImage, updateCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },

        {
            name: "coverImage",
            maxCount: 1
        }
    ]),    
registerUser);

router.route('/login').post(loginUser);

//secured routes for users
router.route('/logout').post(verifyJwt,logoutUser)
router.route('/refresh-token').post(refreshAcessToken)
router.route('/change-password').post(verifyJwt, changeCurrentPassword)
router.route('/current-user').get(verifyJwt, getCurrentUser)
router.route('/update-user').post(verifyJwt, updateAccountDetails)

router.route('/avatar').post(verifyJwt, upload.single('avatar'), updateAvatarImage)
router.route('/cover-image').post(verifyJwt, upload.single('coverImage'), updateCoverImage)
router.route('/c/:username').get(verifyJwt,getUserChannelProfile)
router.route('/history').get(verifyJwt,getWatchHistory)

export default router