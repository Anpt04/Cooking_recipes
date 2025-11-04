const fs = require("fs");
const { Recipe, Category, User, Ingredient, RecipeIngredient } = require("../models");
const cloudinary = require("../config/cloudinary");

// ======================= Lấy tất cả công thức =======================
exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll({
      include: [
        {
          model: Category,
          as: "categories",
          through: { attributes: [] }, // không trả về dữ liệu trung gian
        },
        {
          model: User,
          attributes: ["user_id", "username"],
        },
      ],
      order: [["recipe_id", "ASC"]],
    });

    res.json({ success: true, data: recipes });
  } catch (err) {
    console.error("❌ Lỗi getAllRecipes:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy recipes",
      details: err.message,
    });
  }
};

// ======================= Lấy công thức theo ID =======================
exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: "categories",
          through: { attributes: [] },
        },
        {
          model: User,
          attributes: ["user_id", "username"],
        },
        {
          model: Ingredient,
          as: "ingredients",
          attributes: ["ingredient_id", "name"],
          through: {
            attributes: ["quantity"], 
          },
        },
      ],
    });
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy recipe",
      });
    }

    res.json({ success: true, data: recipe });
  } catch (err) {
    console.error("❌ Lỗi getRecipeById:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy recipe",
      details: err.message,
    });
  }
};

// ======================= Thêm mới công thức =======================
exports.createRecipe = async (req, res) => {
  try {
    const { user_id, title, description, cooking_time, servings, category_ids } = req.body;
    const file = req.file;

    if (!user_id || !title) {
      return res.status(400).json({
        success: false,
        message: "Thiếu user_id hoặc title",
      });
    }

    // ✅ Upload ảnh nếu có
    let image_url = null;
    let image_public_id = null;

    if (file) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "recipes/main",
        format: "jpg",
        transformation: [{ quality: "auto" }],
      });
      image_url = result.secure_url;
      image_public_id = result.public_id;

      fs.unlink(file.path, (err) => {
        if (err) console.error("❌ Không xóa được file local:", err);
      });
    }

    // ✅ Tạo công thức
    const newRecipe = await Recipe.create({
      user_id,
      title,
      description,
      cooking_time,
      servings,
      image_url,
      image_public_id,
    });

    // ✅ Gán category
    if (category_ids) {
      await newRecipe.setCategories(category_ids);
    }

    // ✅ Lấy lại đầy đủ dữ liệu
    const recipeWithCategories = await Recipe.findByPk(newRecipe.recipe_id, {
      include: ["categories"],
    });

    return res.status(201).json({
      success: true,
      data: recipeWithCategories,
    });
  } catch (err) {
    console.error("❌ Lỗi createRecipe:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo recipe",
      details: err.message,
    });
  }
};


// ======================= Cập nhật công thức =======================
exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy recipe",
      });
    }

    const { title, description, cooking_time, servings, category_ids } = req.body || {};
    const file = req.file;

    let image_url = recipe.image_url;
    let image_public_id = recipe.image_public_id;

    // Nếu có file upload mới
    if (file) {
      if (image_public_id) {
        await cloudinary.uploader.destroy(image_public_id); // xóa ảnh cũ
      }

      const result = await cloudinary.uploader.upload(file.path, {
        folder: "recipes/main",
        format: "jpg",
        transformation: [{ quality: "auto" }],
      });
      image_url = result.secure_url;
      image_public_id = result.public_id;

      fs.unlink(file.path, (err) => {
        if (err) console.error("❌ Không xóa được file local:", err);
      });
    }

    // Update recipe
    await recipe.update({
      title: title ?? recipe.title,
      description: description ?? recipe.description,
      cooking_time: cooking_time ?? recipe.cooking_time,
      servings: servings ?? recipe.servings,
      image_url,
      image_public_id,
      updated_at: new Date(),
    });

    // Update categories nếu có
    if (category_ids) {
      await recipe.setCategories(category_ids);
    }

    res.json({ success: true, data: recipe });
  } catch (err) {
    console.error("❌ Lỗi updateRecipe:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật recipe",
      details: err.message,
    });
  }
};

// ======================= Xóa công thức =======================
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy recipe",
      });
    }

    // Xóa ảnh chính trên Cloudinary
    if (recipe.image_public_id) {
      await cloudinary.uploader.destroy(recipe.image_public_id);
    }

    await recipe.destroy();

    res.json({ success: true, message: "Xóa recipe thành công" });
  } catch (err) {
    console.error("❌ Lỗi deleteRecipe:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa recipe",
      details: err.message,
    });
  }
};
