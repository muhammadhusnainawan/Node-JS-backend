import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getPlaylistById,
  getUserPlaylists
} from "../controllers/playlist.controllers.js";

const router = Router();
router.use(verifyJWT); //apply verifyJWT middleware to all routes

router.route("/").post(createPlaylist);
router.route("/:playlistId")
.patch(updatePlaylist)
.delete(deletePlaylist)
.get(getPlaylistById)
router.route("/addVideo/:videoId/:playlistId").patch(addVideoToPlaylist)
router.route("/delVideo/:videoId/:playlistId").patch(removeVideoFromPlaylist)
router.route("/user/:userId").get(getUserPlaylists)

export default router;
