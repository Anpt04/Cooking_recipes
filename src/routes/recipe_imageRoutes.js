const express = require("express");
const multer = require("multer");
const { addRecipeImage, updateRecipeImage, deleteRecipeImage, getRecipeImages } = require("../controllers/recipe_imageController");

const router = express.Router();

// Cấu hình Multer để lưu file tạm
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.get("/", getRecipeImages);

// Route thêm ảnh
router.post("/", upload.single("image"), addRecipeImage);

// Route sửa ảnh
router.put("/:image_id", upload.single("image"), updateRecipeImage);

// Route xóa ảnh
router.delete("/:image_id", deleteRecipeImage);

module.exports = router;
