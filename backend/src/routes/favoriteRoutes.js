// routes/favoriteRoutes.js
const express = require("express");
const {
  getFavoritesByUser,
  addFavorite,
  removeFavorite,
} = require("../controllers/favoriteController");

const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// 🔹 Lấy danh sách món yêu thích của user (đăng nhập mới xem được)
router.get("/:user_id", authMiddleware, getFavoritesByUser);

// 🔹 Thêm món vào danh sách yêu thích
router.post("/", authMiddleware, addFavorite);

// 🔹 Xóa món khỏi danh sách yêu thích
router.delete("/:user_id/:recipe_id", authMiddleware, removeFavorite);

module.exports = router;
