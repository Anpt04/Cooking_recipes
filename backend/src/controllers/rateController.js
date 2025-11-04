const { Rate, User, Recipe } = require("../models");

// 🟢 Thêm hoặc cập nhật đánh giá (nếu user đã đánh giá thì cập nhật)
exports.addOrUpdateRate = async (req, res) => {
  try {
    const { user_id, recipe_id, rating, comment } = req.body;

    if (!user_id || !recipe_id || !rating) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc (user_id, recipe_id, rating).",
      });
    }

    // Tìm xem user đã đánh giá chưa
    const existingRate = await Rate.findOne({ where: { user_id, recipe_id } });

    if (existingRate) {
      existingRate.rating = rating;
      existingRate.comment = comment || existingRate.comment;
      await existingRate.save();
      return res.json({
        success: true,
        message: "Cập nhật đánh giá thành công.",
        data: existingRate,
      });
    }

    const newRate = await Rate.create({ user_id, recipe_id, rating, comment });
    res.status(201).json({
      success: true,
      message: "Thêm đánh giá thành công.",
      data: newRate,
    });
  } catch (error) {
    console.error("❌ Lỗi khi thêm/cập nhật đánh giá:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm/cập nhật đánh giá.",
      details: error.message,
    });
  }
};

// 🟡 Lấy tất cả đánh giá của một công thức
exports.getRatesByRecipe = async (req, res) => {
  try {
    const { recipe_id } = req.params;

    const rates = await Rate.findAll({
      where: { recipe_id },
      include: [
        {
          model: User,
          as: 'user', // 👈 alias phải đúng
          attributes: ['user_id', 'username', 'email'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: rates });
  } catch (error) {
    console.error("❌ Lỗi khi lấy đánh giá:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách đánh giá.",
      details: error.message,
    });
  }
};

// 🧮 Lấy điểm trung bình của công thức
// exports.getAverageRating = async (req, res) => {
//   try {
//     const { recipe_id } = req.params;

//     const result = await Rate.findAll({
//       where: { recipe_id },
//       attributes: [
//         [sequelize.fn("AVG", sequelize.col("rating")), "avg_rating"],
//         [sequelize.fn("COUNT", sequelize.col("user_id")), "total_reviews"],
//       ],
//     });

//     const avg = result[0].dataValues.avg_rating || 0;
//     const total = result[0].dataValues.total_reviews || 0;

//     res.json({ success: true, avg_rating: Number(avg), total_reviews: total });
//   } catch (error) {
//     console.error("❌ Lỗi khi tính trung bình:", error);
//     res.status(500).json({
//       success: false,
//       message: "Lỗi server khi tính điểm trung bình.",
//       details: error.message,
//     });
//   }
// };

// 🔴 Xóa đánh giá
exports.deleteRate = async (req, res) => {
  try {
    const { user_id, recipe_id } = req.params;

    const rate = await Rate.findOne({ where: { user_id, recipe_id } });
    if (!rate) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá để xóa.",
      });
    }

    await rate.destroy();
    res.json({ success: true, message: "Đã xóa đánh giá thành công." });
  } catch (error) {
    console.error("❌ Lỗi khi xóa đánh giá:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa đánh giá.",
      details: error.message,
    });
  }
};
