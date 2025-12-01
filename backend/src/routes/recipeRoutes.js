// routes/recipeRoutes.js
const express = require("express");
const router = express.Router();
const { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, getPendingRecipes, approveRecipe, rejectRecipe, getApprovedRecipes,
    getRecipesByUser,
 } = require("../controllers/recipeController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/imgUpload"); 
const roleCheck = require("../middlewares/roleMiddleware");

router.get("/recipes/pending",authMiddleware, roleCheck("admin"), getPendingRecipes);
router.put("/recipes/:id/approve",authMiddleware, roleCheck("admin"), approveRecipe);
router.put("/recipes/:id/reject",authMiddleware, roleCheck("admin"), rejectRecipe);


// Ai cũng có thể xem công thức
router.get("/approved", getApprovedRecipes);
router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);

// Người dùng đã đăng nhập mới thêm/sửa/xóa
router.post("/", authMiddleware, upload.single("image"), createRecipe);
router.put("/:id", authMiddleware, upload.single("image"), updateRecipe);
router.delete("/:id", authMiddleware, deleteRecipe);
router.get("/user/:id",authMiddleware, getRecipesByUser);



module.exports = router;
