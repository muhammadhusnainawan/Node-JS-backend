import { Router } from "express";
import { getChannelStats } from "../controllers/dashboard.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); //applying verifyJWT to all routes

router.route("/channelstats").get(getChannelStats);

export default router;
