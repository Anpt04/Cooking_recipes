// routes/ingredientRoutes.js
const express = require("express");
const {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} = require("../controllers/ingredientController");

const { authMiddleware } = require("../middlewares/authMiddleware");
const roleCheck = require("../middlewares/roleMiddleware");

const router = express.Router();

// 🟢 Public routes
router.get("/", getAllIngredients);
router.get("/:id", getIngredientById);

// 🔒 Admin routes
router.post("/", authMiddleware, roleCheck("admin"), createIngredient);
router.put("/:id", authMiddleware, roleCheck("admin"), updateIngredient);
router.delete("/:id", authMiddleware, roleCheck("admin"), deleteIngredient);

module.exports = router;
