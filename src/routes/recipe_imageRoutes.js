const express = require("express");
const { addRecipeImage, updateRecipeImage, deleteRecipeImage, getRecipeImages } = require("../controllers/recipe_imageController");
const upload = require("../middlewares/imgUpload"); 

const router = express.Router();

// Lấy ảnh
router.get("/", getRecipeImages);

// Thêm ảnh
router.post("/", upload.single("image"), addRecipeImage);

// Sửa ảnh
router.put("/:image_id", upload.single("image"), updateRecipeImage);

// Xóa ảnh
router.delete("/:image_id", deleteRecipeImage);

module.exports = router;
