import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment,getVideoComments,updateComment } from "../controllers/comment.controller.js";
import { Comment } from "../models/comment.model.js";
import { checkOwner } from "../middlewares/owner.middleware.js";

const router = Router();
router.use(verifyJwt)

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(checkOwner(Comment, "params.commentId"), deleteComment).patch(checkOwner(Comment, "params.commentId"), updateComment);

export default router