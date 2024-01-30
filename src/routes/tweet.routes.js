import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
} from "../controllers/tweet.controllers.js";

const router = Router();

router.use(verifyJWT); // apply verifyJWT to all routes

router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId")
.patch(updateTweet)
.delete(deleteTweet)

export default router;
