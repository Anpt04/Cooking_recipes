const express = require("express");
const router = express.Router();
const { authMiddleware, authorizeRole } = require("../middlewares/authMiddleware");
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  countFollowers,
  countFollowing
} = require("../controllers/followController");

router.post("/:following_id", authMiddleware, followUser);
router.delete("/:following_id", authMiddleware, unfollowUser);

router.get("/:userId/followers", getFollowers);
router.get("/:userId/following", getFollowing);

router.get("/:id/followers/count", countFollowers);
router.get("/:id/following/count", countFollowing);
module.exports = router;
