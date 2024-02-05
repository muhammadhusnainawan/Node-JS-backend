import { Router } from "express";
import { getChannelStats,getAllVideos } from "../controllers/dashboard.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); //applying verifyJWT to all routes

router.route("/channelstats").get(getChannelStats);
router.route("/channelvideos").get(getAllVideos);

export default router;
