const { RecipeStep, Recipe, RecipeImage} = require("../models");

// 📘 Lấy tất cả bước của 1 công thức
exports.getAllSteps = async (req, res) => {
  try {
    const { recipeId } = req.params;

    const steps = await RecipeStep.findAll({
      where: { recipe_id: recipeId },
      include: [
        {
          model: RecipeImage,
          as: "RecipeImages", // alias phải trùng với define association
          attributes: ["image_id", "image_url", "public_id"],
        },
      ],
      order: [["step_number", "ASC"]],
    });

    res.json({
      success: true,
      data: steps,
    });
  } catch (error) {
    console.error("❌ getAllByRecipe error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách bước",
      details: error.message,
    });
  }
};

// 📘 Lấy chi tiết 1 bước
exports.getStepById = async (req, res) => {
  try {
    const { id } = req.params;
    const step = await RecipeStep.findByPk(id, {
      include: [
        {
          model: RecipeImage,
          as: "RecipeImages", // hoặc "images" nếu bạn có đặt alias khác
          attributes: ["image_id", "image_url", "public_id"],
        },
      ],
    });

    if (!step) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bước này",
      });
    }

    res.json({
      success: true,
      data: step,
    });
  } catch (error) {
    console.error("❌ getStepById error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết bước",
      details: error.message,
    });
  }
};

// ➕ Tạo bước mới
exports.createStep = async (req, res) => {
  try {
    console.log("🧾 req.body:", req.body);
    console.log("📸 req.file:", req.file);

    const { recipe_id, step_number, instruction } = req.body;

    // 🔎 Kiểm tra recipe tồn tại
    const recipe = await Recipe.findByPk(recipe_id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe không tồn tại",
      });
    }

    // ✅ Tạo bước
    const step = await RecipeStep.create({
      recipe_id,
      step_number,
      instruction,
    });

    res.status(201).json({
      success: true,
      message: "Tạo bước thành công",
      data: step,
    });
  } catch (error) {
    console.error("❌ createStep error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo bước mới",
      details: error.message,
    });
  }
};

// ✏️ Cập nhật bước
exports.updateStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { step_number, instruction } = req.body;

    const step = await RecipeStep.findByPk(id);
    if (!step) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bước cần cập nhật",
      });
    }

    await step.update({
      step_number: step_number ?? step.step_number,
      instruction: instruction ?? step.instruction,
    });

    res.json({
      success: true,
      message: "Cập nhật bước thành công",
      data: step,
    });
  } catch (error) {
    console.error("❌ updateStep error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật bước",
      details: error.message,
    });
  }
};

// 🗑️ Xóa bước
exports.deleteStep = async (req, res) => {
  try {
    const { id } = req.params;
    const step = await RecipeStep.findByPk(id);

    if (!step) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bước cần xóa",
      });
    }

    await step.destroy();

    res.json({
      success: true,
      message: "Xóa bước thành công",
    });
  } catch (error) {
    console.error("❌ deleteStep error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa bước",
      details: error.message,
    });
  }
};

exports.deleteStepsByRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;

    // 🔎 Lấy danh sách step_id
    const steps = await RecipeStep.findAll({
      where: { recipe_id: recipeId },
      attributes: ["step_id"],
    });

    if (!steps.length) {
      return res.json({
        success: true,
        message: "Không có bước nào để xóa",
      });
    }

    const stepIds = steps.map((s) => s.step_id);

    // 🗑 XÓA ẢNH liên quan step
    const images = await RecipeImage.findAll({
      where: { step_id: stepIds },
    });

    for (const img of images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await RecipeImage.destroy({ where: { step_id: stepIds } });

    // 🗑 XOÁ STEP
    await RecipeStep.destroy({ where: { recipe_id: recipeId } });

    res.json({
      success: true,
      message: `Đã xóa ${stepIds.length} bước và ${images.length} ảnh`,
    });

  } catch (err) {
    console.error("❌ deleteStepsByRecipe error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa tất cả bước",
      details: err.message,
    });
  }
};
