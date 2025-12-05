const fs = require("fs");
const {
  Recipe,
  Category,
  User,
  Ingredient,
  RecipeIngredient,
  RecipeReport,
} = require("../models");
const cloudinary = require("../config/cloudinary");

// ======================= Lấy tất cả công thức =======================
exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll({
      where: { status: "approved" },
      include: [
        {
          model: Category,
          as: "categories",
          through: { attributes: [] },
        },
        {
          model: Ingredient,
          as: "ingredients",
          attributes: ["ingredient_id", "name"],
          through: {
            attributes: ["quantity"],
          },
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
          attributes: ["ingredient_id", "name", "unit"],
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
    const {
      user_id,
      title,
      description,
      cooking_time,
      servings,
      category_ids,
      difficulty,
    } = req.body;
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
      difficulty,
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

    const {
      title,
      description,
      cooking_time,
      servings,
      category_ids,
      difficulty,
    } = req.body || {};
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
      difficulty: difficulty ?? recipe.difficulty,
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
//=======lấy công thức chờ duyệt======
exports.getPendingRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll({
      where: { status: "pending" },
      include: [
        { model: User, attributes: ["username"] },
        { model: Category, as: "categories" },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ success: true, data: recipes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin duyệt công thức
exports.approveRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    await Recipe.update(
      { status: "approved", reject_reason: null },
      { where: { recipe_id: id } }
    );

    res.json({ success: true, message: "Recipe approved!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin từ chối công thức
exports.rejectRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason)
      return res
        .status(400)
        .json({ success: false, message: "Reason required" });

    await Recipe.update(
      { status: "rejected", reject_reason: reason },
      { where: { recipe_id: id } }
    );

    res.json({ success: true, message: "Recipe rejected" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// lấy công thức đã duyệt
exports.getApprovedRecipes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;

    const total = await Recipe.count({
      where: { status: "approved" },
    });

    const recipes = await Recipe.findAll({
      where: { status: "approved" },
      include: [
        {
          model: Category,
          as: "categories",
          through: { attributes: [] },
        },
        {
          model: Ingredient,
          as: "ingredients",
          attributes: ["ingredient_id", "name"],
          through: {
            attributes: ["quantity"],
          },
        },
        {
          model: User,
          attributes: ["user_id", "username"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      page,
      limit,
      total,
      totalPages,
      data: recipes,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//lấy công thức theo status
exports.getRecipesByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const whereClause = { user_id: id };
    if (status) whereClause.status = status;

    const recipes = await Recipe.findAll({ where: whereClause });

    res.json({ success: true, data: recipes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User -> gửi báo cáo recipe
exports.reportRecipe = async (req, res) => {
  try {
    const { id } = req.params; // recipe_id
    const { reason } = req.body;
    const reporter_id = req.user?.user_id;

    if (!reporter_id)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!reason || reason.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Lý do báo cáo là bắt buộc" });
    }

    // Optionally: kiểm tra recipe tồn tại
    const recipe = await Recipe.findByPk(id);
    if (!recipe)
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });

    const report = await RecipeReport.create({
      recipe_id: id,
      reporter_id,
      reason: reason.trim(),
    });

    res.status(201).json({ success: true, message: "Đã gửi báo cáo", report });
  } catch (err) {
    console.error("reportRecipe error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", details: err.message });
  }
};

// Admin -> lấy list báo cáo (kèm recipe + reporter)
exports.getAllReports = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const reports = await RecipeReport.findAll({
      where,
      include: [
        {
          model: User,
          as: "reporter",
          attributes: ["user_id", "username", "email"],
        },
        {
          model: Recipe,
          as: "recipe",
          attributes: ["recipe_id", "title", "image_url", "user_id"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ success: true, reports });
  } catch (err) {
    console.error("getAllReports error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", details: err.message });
  }
};

// Admin -> resolve
exports.resolveReport = async (req, res) => {
  try {
    const { id } = req.params; // report_id
    const { admin_note } = req.body; // ghi chú admin

    // Lấy report
    const report = await RecipeReport.findByPk(id);
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    // Lấy recipe liên quan
    const recipe = await Recipe.findByPk(report.recipe_id);
    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    // --- 1) Cập nhật báo cáo ---
    report.status = "resolved";
    report.admin_note = admin_note || report.admin_note;
    await report.save();

    // --- 2) Tự động reject recipe ---
    await Recipe.update(
      {
        status: "rejected",
        reject_reason: admin_note || "Recipe vi phạm quy tắc!",
      },
      { where: { recipe_id: recipe.recipe_id } }
    );

    res.json({
      success: true,
      message: "Report resolved and recipe rejected",
      report,
    });
  } catch (err) {
    console.error("resolveReport error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", details: err.message });
  }
};

// Admin -> reject
exports.rejectReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_note } = req.body;

    if (!admin_note) {
      return res
        .status(400)
        .json({
          success: false,
          message: "admin_note is required when rejecting",
        });
    }

    const report = await RecipeReport.findByPk(id);
    if (!report)
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });

    report.status = "rejected";
    report.admin_note = admin_note;
    await report.save();

    res.json({ success: true, message: "Report rejected", report });
  } catch (err) {
    console.error("rejectReport error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", details: err.message });
  }
};
