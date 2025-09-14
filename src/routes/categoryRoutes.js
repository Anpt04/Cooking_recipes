// routes/categoryRoute.js
const express = require("express");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const roleCheck = require("../middlewares/roleMiddleware");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Protected routes (chỉ admin mới có quyền)
router.post("/", authMiddleware, roleCheck("admin"), createCategory);
router.put("/:id", authMiddleware, roleCheck("admin"), updateCategory);
router.delete("/:id", authMiddleware, roleCheck("admin"), deleteCategory);

module.exports = router;
