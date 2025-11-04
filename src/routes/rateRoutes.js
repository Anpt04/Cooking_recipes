// routes/rateRoutes.js
const express = require("express");
const {
  addOrUpdateRate,
  getRatesByRecipe,
  getAverageRating,
  deleteRate,
} = require("../controllers/rateController");

const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// 🟢 Thêm hoặc cập nhật đánh giá
router.post("/", authMiddleware, addOrUpdateRate);

// 🟡 Lấy danh sách đánh giá của 1 công thức
router.get("/recipe/:recipe_id", getRatesByRecipe);

// 🧮 Lấy điểm trung bình của 1 công thức
// router.get("/average/:recipe_id", getAverageRating);

// 🔴 Xóa đánh giá
router.delete("/:user_id/:recipe_id", authMiddleware, deleteRate);

module.exports = router;
