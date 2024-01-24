import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleVideoLike,
  toggleCommentLike,
} from "../controllers/like.controllers.js";
const router = Router();

router.use(verifyJWT); // Apply verifyJwt to all routes in this file

router.route("/toggle/video/:videoId").post(toggleVideoLike);
router.route("/toggle/comment/:commentId").post(toggleCommentLike);

export default router;
