const { Category } = require("../models");

// Lấy tất cả category
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy 1 category theo id
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Tạo category mới
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Kiểm tra trùng tên
    const existing = await Category.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: "Danh mục đã tồn tại" });
    }

    const category = await Category.create({ name });
    res.status(201).json({ message: "Tạo danh mục thành công", category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Cập nhật category
exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    category.name = name || category.name;
    await category.save();

    res.json({ message: "Cập nhật thành công", category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Xóa category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    await category.destroy();
    res.json({ message: "Xóa danh mục thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
