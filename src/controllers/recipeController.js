// controllers/recipeController.js
const { Recipe } = require("../models");

// Lấy tất cả công thức
exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi lấy recipes", details: err.message });
  }
};

// Lấy công thức theo id
exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Không tìm thấy recipe" });
    }
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi lấy recipe", details: err.message });
  }
};

// Thêm mới recipe
exports.createRecipe = async (req, res) => {
  try {
    const { user_id, category_id, title, description, cooking_time, servings } = req.body;

    if (!user_id || !title) {
      return res.status(400).json({ error: "Thiếu user_id hoặc title" });
    }

    const newRecipe = await Recipe.create({
      user_id,
      category_id,
      title,
      description,
      cooking_time,
      servings,
    });

    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi tạo recipe", details: err.message });
  }
};

// Cập nhật recipe
exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Không tìm thấy recipe" });
    }

    const { title, description, cooking_time, servings, category_id } = req.body;

    await recipe.update({
      title: title ?? recipe.title,
      description: description ?? recipe.description,
      cooking_time: cooking_time ?? recipe.cooking_time,
      servings: servings ?? recipe.servings,
      category_id: category_id ?? recipe.category_id,
      updated_at: new Date(),
    });

    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi cập nhật recipe", details: err.message });
  }
};

// Xóa recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Không tìm thấy recipe" });
    }

    await recipe.destroy();
    res.json({ message: "Xóa recipe thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi server khi xóa recipe", details: err.message });
  }
};
