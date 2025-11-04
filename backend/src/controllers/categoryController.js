const { Category } = require("../models");

// Lấy tất cả category
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách category",
      details: error.message,
    });
  }
};

// Lấy 1 category theo id
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }
    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy category",
      details: error.message,
    });
  }
};

// Tạo category mới
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { description } = req.body;

    // Kiểm tra trùng tên
    const existing = await Category.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Danh mục đã tồn tại",
      });
    }

    const category = await Category.create({ name, description });
    res.status(201).json({
      success: true,
      message: "Tạo danh mục thành công",
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo category",
      details: error.message,
    });
  }
};

// Cập nhật category
exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { description } = req.body;
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    category.name = name || category.name;
    category.description = description || category.description;
    await category.save();

    res.json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật category",
      details: error.message,
    });
  }
};

// Xóa category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    await category.destroy();
    res.json({
      success: true,
      message: "Xóa danh mục thành công",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa category",
      details: error.message,
    });
  }
};
