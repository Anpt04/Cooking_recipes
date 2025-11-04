const { RecipeCategory } = require('../models');

exports.add = async (req, res) => {
  try {
    const { recipe_id, category_id } = req.body;

    const record = await RecipeCategory.create({ recipe_id, category_id });
    res.json({ success: true, data: record });
  } catch (err) {
    console.error("❌ add recipe-category error:", err);
    res.status(500).json({ success: false, message: "Lỗi khi thêm danh mục cho công thức" });
  }
};

exports.getByRecipe = async (req, res) => {
  try {
    const { recipe_id } = req.params;
    const data = await RecipeCategory.findAll({ where: { recipe_id } });
    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ get recipe-category error:", err);
    res.status(500).json({ success: false, message: "Lỗi khi lấy danh mục của công thức" });
  }
};

exports.delete = async (req, res) => {
  try {
    const { recipe_id, category_id } = req.body;
    await RecipeCategory.destroy({ where: { recipe_id, category_id } });
    res.json({ success: true, message: "Đã xóa danh mục khỏi công thức" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi khi xóa" });
  }
};
