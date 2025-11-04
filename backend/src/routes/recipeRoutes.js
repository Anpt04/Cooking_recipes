// routes/recipeRoutes.js
const express = require("express");
const router = express.Router();
const { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe } = require("../controllers/recipeController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/imgUpload"); 


// Ai cũng có thể xem công thức
router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);

// Người dùng đã đăng nhập mới thêm/sửa/xóa
router.post("/", authMiddleware, upload.single("image"), createRecipe);
router.put("/:id", authMiddleware, upload.single("image"), updateRecipe);
router.delete("/:id", authMiddleware, deleteRecipe);

module.exports = router;
