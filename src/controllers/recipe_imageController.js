const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const { RecipeImage } = require("../models");

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

    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Thêm ảnh
exports.addRecipeImage = async function (req, res) {
  try {
    const { recipe_id, step_id, is_main } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    // Upload lên Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "recipes",
    });

    // Xóa file tạm trên local
    fs.unlink(file.path, (err) => {
      if (err) console.error("Failed to delete local file:", err);
    });

    const newImage = await RecipeImage.create({
      recipe_id,
      step_id,
      image_url: result.secure_url,
      public_id: result.public_id,
      is_main: is_main || false,
    });

    res.status(201).json(newImage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Sửa ảnh
exports.updateRecipeImage = async function (req, res) {
  try {
    const { image_id } = req.params;
    const { is_main } = req.body;
    const file = req.file;

    const image = await RecipeImage.findByPk(image_id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    let image_url = image.image_url;
    let public_id = image.public_id;

    if (file) {
      await cloudinary.uploader.destroy(image.public_id);

      const result = await cloudinary.uploader.upload(file.path, {
        folder: "recipes",
      });
      image_url = result.secure_url;
      public_id = result.public_id;

      fs.unlink(file.path, (err) => {
        if (err) console.error("Failed to delete local file:", err);
      });
    }

    await image.update({
      image_url,
      public_id,
      is_main: is_main !== undefined ? is_main : image.is_main,
    });

    res.json(image);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Xóa ảnh
exports.deleteRecipeImage = async function (req, res) {
  try {
    const { image_id } = req.params;
    const image = await RecipeImage.findByPk(image_id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    await cloudinary.uploader.destroy(image.public_id);
    await image.destroy();

    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
