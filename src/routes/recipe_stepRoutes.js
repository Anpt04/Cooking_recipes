const express = require("express");
const {
  getAllSteps,
  getStepById,
  createStep,
  updateStep,
  deleteStep,
} = require("../controllers/recipe_stepController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// 📘 Lấy tất cả bước của 1 công thức
router.get("/recipe/:recipeId", authMiddleware, getAllSteps);

// 📘 Lấy 1 bước cụ thể
router.get("/:id", authMiddleware, getStepById);

// ➕ Tạo bước mới
router.post("/", authMiddleware, createStep);

// ✏️ Cập nhật bước
router.put("/:id", authMiddleware, updateStep);

// 🗑️ Xóa bước
router.delete("/:id", authMiddleware, deleteStep);

module.exports = router;
