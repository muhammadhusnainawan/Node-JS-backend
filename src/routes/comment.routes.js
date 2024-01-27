import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getVideoComments,
  addComment,
} from "../controllers/comment.controllers.js";
const router = Router();

router.use(verifyJWT); // apply verifyJWt to all routes

router.route("/:videoId")
.get(getVideoComments)
.post(addComment);
export default router;
