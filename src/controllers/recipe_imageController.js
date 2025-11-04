const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const { RecipeImage } = require("../models");

// Lấy danh sách ảnh
exports.getRecipeImages = async function (req, res) {
  try {
    const { recipe_id, step_id } = req.query;

    const whereClause = {};
    if (recipe_id) whereClause.recipe_id = recipe_id;
    if (step_id) whereClause.step_id = step_id;

    const images = await RecipeImage.findAll({
      where: whereClause,
      order: [["image_id", "ASC"]],
    });

    res.json({
      success: true,
      data: images,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy images",
      details: err.message,
    });
  }
};


// Thêm ảnh mới
exports.addRecipeImage = async function (req, res) {
  try {
    const { recipe_id, step_id, is_main } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Không có file upload",
      });
    }

    // Upload lên Cloudinary, ép về JPG và tối ưu chất lượng
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "recipes",
      format: "jpg", // ép thành jpg (khắc phục .heic không load)
      transformation: [{ quality: "auto" }],
    });

    // Xóa file tạm local
    fs.unlink(file.path, (err) => {
      if (err) console.error("❌ Failed to delete local file:", err);
    });

    const newImage = await RecipeImage.create({
      recipe_id,
      step_id,
      image_url: result.secure_url,
      public_id: result.public_id,
      is_main: is_main || false,
    });

    res.status(201).json({
      success: true,
      data: newImage,
    });
  } catch (err) {
    console.error("❌ addRecipeImage error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm image",
      details: err.message,
    });
  }
};

// Sửa ảnh
exports.updateRecipeImage = async function (req, res) {
  try {
    const { image_id } = req.params;
    const { is_main } = req.body;
    const file = req.file;

    const image = await RecipeImage.findByPk(image_id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy image",
      });
    }

    let image_url = image.image_url;
    let public_id = image.public_id;

    if (file) {
      // Xóa ảnh cũ trên Cloudinary
      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id);
      }

      // Upload ảnh mới lên Cloudinary, ép về JPG
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "recipes",
        format: "jpg",
        transformation: [{ quality: "auto" }],
      });

      image_url = result.secure_url;
      public_id = result.public_id;

      // Xóa file tạm local
      fs.unlink(file.path, (err) => {
        if (err) console.error("❌ Failed to delete local file:", err);
      });
    }

    await image.update({
      image_url,
      public_id,
      is_main: is_main !== undefined ? is_main : image.is_main,
    });

    res.json({
      success: true,
      data: image,
    });
  } catch (err) {
    console.error("❌ updateRecipeImage error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật image",
      details: err.message,
    });
  }
};

// Xóa ảnh
exports.deleteRecipeImage = async function (req, res) {
  try {
    const { image_id } = req.params;
    const image = await RecipeImage.findByPk(image_id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy image",
      });
    }

    await cloudinary.uploader.destroy(image.public_id);
    await image.destroy();

    res.json({
      success: true,
      message: "Xóa image thành công",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa image",
      details: err.message,
    });
  }
};
