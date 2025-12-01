const { Rate, User, RateReport } = require("../models");

//  Thêm hoặc cập nhật đánh giá (nếu user đã đánh giá thì cập nhật)
exports.addOrUpdateRate = async (req, res) => {
  try {
    const {user_id, recipe_id, rating, comment } = req.body;

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

// Lấy tất cả đánh giá của một công thức
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


// 🔴 Xóa đánh giá
exports.deleteRate = async (req, res) => {
  try {
    const { rate_id } = req.params;

    const rate = await Rate.findOne({ where: { rate_id } });
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

exports.reportComment = async (req, res) => {
  try {
    const rate_id = req.params.id;
    const { reason } = req.body;
    const reporter_id = req.user.user_id;

    const report = await RateReport.create({
      rate_id,
      reporter_id,
      reason
    });

    res.json({ success: true, report });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await RateReport.findAll({
      include: [
        {
          model: Rate,
          as: "rate",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["user_id", "username", "avatar_url"],
            },
          ],
        },
        {
          model: User,
          as: "reporter",
          attributes: ["user_id", "username"],
        },
      ],
      order: [["created_at", "DESC"]],
    });


    res.json({ success: true, reports });
  } catch (error) {
    console.error("🔥 Lỗi getAllReports:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

exports.approveRateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_note } = req.body;

    const report = await RateReport.findByPk(id);
    if (!report) return res.status(404).json({ message: "Report không tồn tại" });

    await Rate.destroy({ where: { rate_id: report.rate_id } });

    await report.update({
      status: "approved",
      admin_note: admin_note || "",
    });

    res.json({ success: true, message: "Đã xoá bình luận vi phạm." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.rejectRateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_note } = req.body;

    const report = await RateReport.findByPk(id);
    if (!report) return res.status(404).json({ message: "Report không tồn tại" });

    await report.update({
      status: "rejected",
      admin_note: admin_note || "",
    });

    res.json({ success: true, message: "Đã từ chối báo cáo." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
