const { Op } = require("sequelize");
const { Ingredient, IngredientRequest, User } = require("../models");

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
    const { name, unit } = req.body;

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

    const ingredient = await Ingredient.create({ name, unit});
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
    const { name, unit } = req.body; 
    const ingredient = await Ingredient.findByPk(req.params.id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nguyên liệu",
      });
    }

    // Kiểm tra trùng tên nhưng KHÔNG phải chính nó
    if (name) {
      const duplicate = await Ingredient.findOne({
        where: {
          name,
          ingredient_id: { [Op.ne]: ingredient.ingredient_id },
        },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Tên nguyên liệu đã tồn tại",
        });
      }
    }

    // ⬅️ Cập nhật dữ liệu
    ingredient.name = name || ingredient.name;
    ingredient.unit = unit || ingredient.unit;  

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

exports.requestIngredient = async (req, res) => {
  try {
    const { ingredient_name, unit, reason } = req.body;
    const user_id = req.user.user_id;

    const request = await IngredientRequest.create({
      user_id,
      ingredient_name,
      unit,
      reason,
    });

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const where = status ? { status } : {};

    const list = await IngredientRequest.findAll({
      where,
      include: [
        { model: User, attributes: ["user_id", "username", "email"] }
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ success: true, requests: list });

  } catch (err) {
    console.error("❌ getAllRequests error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_note } = req.body;

    const reqData = await IngredientRequest.findByPk(id);

    if (!reqData) 
      return res.status(404).json({ message: "Request not found" });

    const newIngredient = await Ingredient.create({
      name: reqData.ingredient_name,
      unit: reqData.unit,
    });

    reqData.status = "approved";
    reqData.admin_note = admin_note || "";
    await reqData.save();

    res.json({
      success: true,
      message: "Approved & Ingredient added",
      ingredient: newIngredient
    });

  } catch (err) {
    console.error("⚠️ approveRequest error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.rejectRequest = async (req, res) => {
  const id = req.params.id;
  const { admin_note } = req.body;

  await IngredientRequest.update(
    { status: "rejected", admin_note },
    { where: { request_id: id } }
  );

  res.json({ success: true, message: "Rejected" });
};
