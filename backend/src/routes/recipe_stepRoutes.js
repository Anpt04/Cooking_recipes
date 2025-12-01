const express = require("express");
const {
  getAllSteps,
  getStepById,
  createStep,
  updateStep,
  deleteStep,
  deleteStepsByRecipe
} = require("../controllers/recipe_stepController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/imgUpload");
const router = express.Router();

// 📘 Lấy tất cả bước của 1 công thức
router.get("/recipe/:recipeId", getAllSteps);

// 📘 Lấy 1 bước cụ thể
router.get("/:id", authMiddleware, getStepById);

// ➕ Tạo bước mới
router.post("/", authMiddleware, createStep);

// ✏️ Cập nhật bước
router.put("/:id", authMiddleware, upload.none(), updateStep);

// 🗑️ Xóa bước
router.delete("/:id", authMiddleware, deleteStep);

router.delete("/recipe/:recipeId", deleteStepsByRecipe);

module.exports = router;
