const { Ingredient } = require("../models");

// 🟢 Lấy tất cả nguyên liệu
exports.getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll({
      order: [["ingredient_id", "ASC"]],
    });

    res.json({
      success: true,
      data: ingredients,
    });
  } catch (error) {
    console.error("❌ getAllIngredients error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách nguyên liệu",
      details: error.message,
    });
  }
};

// 🟡 Lấy 1 nguyên liệu theo ID
exports.getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByPk(req.params.id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nguyên liệu",
      });
    }

    res.json({
      success: true,
      data: ingredient,
    });
  } catch (error) {
    console.error("❌ getIngredientById error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy nguyên liệu",
      details: error.message,
    });
  }
};

// 🟣 Tạo nguyên liệu mới (chỉ admin)
exports.createIngredient = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên nguyên liệu là bắt buộc",
      });
    }

    // Kiểm tra trùng
    const existing = await Ingredient.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Nguyên liệu đã tồn tại",
      });
    }

    const ingredient = await Ingredient.create({ name });
    res.status(201).json({
      success: true,
      message: "Tạo nguyên liệu thành công",
      data: ingredient,
    });
  } catch (error) {
    console.error("❌ createIngredient error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo nguyên liệu",
      details: error.message,
    });
  }
};

// 🟠 Cập nhật nguyên liệu (chỉ admin)
exports.updateIngredient = async (req, res) => {
  try {
    const { name } = req.body;
    const ingredient = await Ingredient.findByPk(req.params.id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nguyên liệu",
      });
    }

    // Kiểm tra trùng tên khác
    const duplicate = await Ingredient.findOne({
      where: { name, ingredient_id: { [sequelize.Op.ne]: ingredient.ingredient_id } },
    });
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Tên nguyên liệu đã tồn tại",
      });
    }

    ingredient.name = name || ingredient.name;
    await ingredient.save();

    res.json({
      success: true,
      message: "Cập nhật nguyên liệu thành công",
      data: ingredient,
    });
  } catch (error) {
    console.error("❌ updateIngredient error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật nguyên liệu",
      details: error.message,
    });
  }
};

// 🔴 Xóa nguyên liệu (chỉ admin)
exports.deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByPk(req.params.id);
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nguyên liệu",
      });
    }

    await ingredient.destroy();

    res.json({
      success: true,
      message: "Xóa nguyên liệu thành công",
    });
  } catch (error) {
    console.error("❌ deleteIngredient error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa nguyên liệu",
      details: error.message,
    });
  }
};
