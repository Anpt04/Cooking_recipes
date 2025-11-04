const express = require("express");
const {
  getIngredientsByRecipe,
  addIngredientToRecipe,
  updateIngredientInRecipe,
  deleteIngredientFromRecipe,
} = require("../controllers/recipe_ingredientController");

const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// 🔹 Lấy danh sách nguyên liệu của 1 công thức (public)
router.get("/:recipe_id", getIngredientsByRecipe);

// 🔸 Các route cần xác thực (người tạo công thức hoặc admin)
router.post("/", authMiddleware, addIngredientToRecipe);
router.put("/:recipe_id/:ingredient_id", authMiddleware, updateIngredientInRecipe);
router.delete("/:recipe_id/:ingredient_id", authMiddleware, deleteIngredientFromRecipe);

module.exports = router;
