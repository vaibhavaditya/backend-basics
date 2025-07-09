import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createPlaylist,addVideoToPlaylist,removeVideoFromPlaylist,deletePlaylist,getUserPlaylists,getPlaylistById,updatePlaylist } from "../controllers/playlist.controller.js";
import {checkOwner} from "../middlewares/owner.middleware.js"
import { Playlist } from "../models/playlist.model.js";
const router = Router();
router.use(verifyJwt)

router.route("/").post(createPlaylist)

router
    .route("/:playlistId")
    .get(checkOwner(Playlist, "params.playlistId"),getPlaylistById)
    .patch(checkOwner(Playlist, "params.playlistId"),updatePlaylist)
    .delete(checkOwner(Playlist, "params.playlistId"),deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(checkOwner(Playlist, "params.playlistId"),addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(checkOwner(Playlist, "params.playlistId"),removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router