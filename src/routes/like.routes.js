import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleVideoLike } from "../controllers/like.controllers.js";
const router = Router();

router.use(verifyJWT); // Apply verifyJwt to all routes in this file

router.route("/toggle/video/:videoId").post(toggleVideoLike);

export default router;
