// routes/followRoutes.js
const express = require("express");
const {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
} = require("../controllers/followController");

const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// 🔹 Theo dõi người khác
router.post("/", authMiddleware, followUser);

// 🔹 Hủy theo dõi
router.delete("/:follower_id/:following_id", authMiddleware, unfollowUser);

// 🔹 Lấy danh sách người mà user đang theo dõi
router.get("/following/:user_id", authMiddleware, getFollowing);

// 🔹 Lấy danh sách người theo dõi user
router.get("/followers/:user_id", authMiddleware, getFollowers);

module.exports = router;
