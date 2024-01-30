import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "../controllers/playlist.controllers.js";

const router = Router();
router.use(verifyJWT); //apply verifyJWT middleware to all routes

router.route("/").post(createPlaylist);
router.route("/:playlistId").patch(updatePlaylist).delete(deletePlaylist);

export default router;
