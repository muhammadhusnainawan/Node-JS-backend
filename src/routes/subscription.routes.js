import { Router } from "express";
import { toggleSubscription } from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

// apply verifyJWT to all routes
router.use(verifyJWT);

router.route("/channels/:channelId").get(toggleSubscription);

export default router;
