import { Router } from "express";
import {
  getSubscribedChannels,
  toggleSubscription,
  getUserChannelSubscribers,
} from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

// apply verifyJWT to all routes
router.use(verifyJWT);

router
  .route("/channels/:channelId")
  // .get(getSubscribedChannels)
  .post(toggleSubscription);

 router.route("/users/:channelId").get(getUserChannelSubscribers);
export default router;
