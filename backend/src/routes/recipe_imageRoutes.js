const express = require("express");
const { addRecipeImage, updateRecipeImage, deleteRecipeImage, getRecipeImages, deleteByRecipe } = require("../controllers/recipe_imageController");
const upload = require("../middlewares/imgUpload"); 

const router = express.Router();

// Lấy ảnh
router.get("/", getRecipeImages);

// Thêm ảnh
router.post("/", upload.single("image"), addRecipeImage);

// Sửa ảnh
router.put("/:image_id", upload.single("image"),upload.none(), updateRecipeImage);

// Xóa ảnh
router.delete("/:image_id", deleteRecipeImage);

router.delete("/recipe/:recipeId", deleteByRecipe);

module.exports = router;
