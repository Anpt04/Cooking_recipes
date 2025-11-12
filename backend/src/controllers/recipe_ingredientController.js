const { RecipeIngredient, Ingredient, Recipe } = require("../models");

// Lấy tất cả nguyên liệu trong 1 công thức
exports.getIngredientsByRecipe = async (req, res) => {
  try {
    const { recipe_id } = req.params;
    const ingredients = await RecipeIngredient.findAll({
      where: { recipe_id },
      include: [
        {
          model: Ingredient,
          as: 'ingredient',
          attributes: ['ingredient_id', 'name']
        }
      ],
    });

    res.json({
      success: true,
      data: ingredients,
    });
  } catch (err) {
    console.error("❌ getIngredientsByRecipe error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy nguyên liệu của công thức",
    });
  }
};

// Thêm nguyên liệu vào công thức
exports.addIngredientToRecipe = async (req, res) => {
  try {
    const { recipe_id, ingredient_id, quantity } = req.body;

    if (!recipe_id || !ingredient_id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin recipe_id hoặc ingredient_id",
      });
    }

    const exists = await RecipeIngredient.findOne({
      where: { recipe_id, ingredient_id },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Nguyên liệu đã tồn tại trong công thức này",
      });
    }

    const recipeIngredient = await RecipeIngredient.create({
      recipe_id,
      ingredient_id,
      quantity,
    });

    res.status(201).json({
      success: true,
      message: "Đã thêm nguyên liệu vào công thức",
      data: recipeIngredient,
    });
  } catch (err) {
    console.error("❌ addIngredientToRecipe error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm nguyên liệu",
      details: err.message,
    });
  }
};

// Cập nhật nguyên liệu trong công thức
exports.updateIngredientInRecipe = async (req, res) => {
  try {
    const { recipe_id, ingredient_id } = req.params;
    const { quantity } = req.body;

    const recipeIngredient = await RecipeIngredient.findOne({
      where: { recipe_id, ingredient_id },
    });

    if (!recipeIngredient) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nguyên liệu trong công thức",
      });
    }

    recipeIngredient.quantity = quantity;
    await recipeIngredient.save();

    res.json({
      success: true,
      message: "Cập nhật nguyên liệu thành công",
      data: recipeIngredient,
    });
  } catch (err) {
    console.error("❌ updateIngredientInRecipe error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật nguyên liệu",
    });
  }
};

// Xóa nguyên liệu khỏi công thức
exports.deleteIngredientFromRecipe = async (req, res) => {
  try {
    const { recipe_id, ingredient_id } = req.params;

    const deleted = await RecipeIngredient.destroy({
      where: { recipe_id, ingredient_id },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nguyên liệu để xóa",
      });
    }

    res.json({
      success: true,
      message: "Xóa nguyên liệu khỏi công thức thành công",
    });
  } catch (err) {
    console.error("❌ deleteIngredientFromRecipe error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa nguyên liệu",
    });
  }
};
