import Router from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  updateUserPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getUserWatchHistory,
} from "../controllers/user.controllers.js";
import { subscription } from "../controllers/subscription.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

//  protected user routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/update-password").post(verifyJWT, updateUserPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails);
router.route("/update-avatar").patch(verifyJWT, updateUserAvatar);
router.route("/update-cover-image").patch(verifyJWT, updateUserCoverImage);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/watch-history").get(verifyJWT, getUserWatchHistory);

router.route("/subscription").post(verifyJWT,subscription)

export default router;
