const express = require("express");
const {
  getAllSteps,
  getStepById,
  createStep,
  updateStep,
  deleteStep,
} = require("../controllers/recipe_stepController");
const { authMiddleware } = require("../middlewares/authMiddleware")

const router = express.Router();

// Lấy tất cả bước của 1 recipe
router.get("/recipe/:recipeId", authMiddleware, getAllSteps);

// Lấy 1 bước
router.get("/:id", authMiddleware, getStepById);

// Tạo bước
router.post("/", authMiddleware, createStep);

// Cập nhật bước
router.put("/:id", authMiddleware, updateStep);

// Xóa bước
router.delete("/:id", authMiddleware, deleteStep);

module.exports = router;
