const { Favorite, Recipe, User, Category } = require("../models");


exports.getFavoritesByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const favorites = await Favorite.findAll({
      where: { user_id },
      include: [
        {
          model: Recipe,
          as: "recipe",
          include: [
            {
              model: User,
              attributes: ["user_id", "username"],
            },
            {
              model: Category,
              as: "categories",
              through: { attributes: [] },
              attributes: ["category_id", "name"],
            },
          ],
        },
      ],
    });

    res.json({
      success: true,
      data: favorites.map(f => f.recipe),
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy favorites:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách yêu thích",
      details: error.message,
    });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { user_id, recipe_id } = req.body;

    // Kiểm tra trùng
    const existing = await Favorite.findOne({ where: { user_id, recipe_id } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Công thức này đã có trong danh sách yêu thích",
      });
    }

    const favorite = await Favorite.create({ user_id, recipe_id });
    res.status(201).json({
      success: true,
      message: "Đã thêm vào danh sách yêu thích",
      data: favorite,
    });
  } catch (error) {
    console.error("❌ Lỗi khi thêm favorite:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm vào danh sách yêu thích",
      details: error.message,
    });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { user_id, recipe_id } = req.params;

    const favorite = await Favorite.findOne({ where: { user_id, recipe_id } });
    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mục yêu thích để xóa",
      });
    }

    await favorite.destroy();

    res.json({
      success: true,
      message: "Đã xóa khỏi danh sách yêu thích",
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa favorite:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa khỏi danh sách yêu thích",
      details: error.message,
    });
  }
};
