import { Router } from "express";
import { createTweet,updateTweet,deleteTweet,getUserTweets} from "../controllers/tweet.controller.js";
import { verifyJwt} from "../middlewares/auth.middleware.js";
import { checkOwner } from "../middlewares/owner.middleware.js";
import { Tweet } from "../models/tweet.model.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();
router.use(verifyJwt)

router.route('/').post(
    upload.array('photos',5),
    createTweet
);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(checkOwner(Tweet, "params.tweetId"),updateTweet).delete(checkOwner(Tweet, "params.tweetId"),deleteTweet);

export default router