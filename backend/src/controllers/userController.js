const { User, UserReport } = require("../models");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");


// Lấy thông tin profile của user (theo userId từ token)
exports.getProfile = async (req, res) => {
  try {
    // userId có thể lấy từ middleware auth (ví dụ JWT decode)
    const userId = req.user.user_id;  

    const user = await User.findByPk(userId, {
      attributes: [
        "user_id",
        "username",
        "email",
        "role",
        "status",
        "avatar_url",
        "created_at",
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    res.json(user);
  } catch (err) {
    console.error("Lỗi khi lấy profile:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Cập nhật thông tin user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.user_id; // lấy từ token
    const { username, email, status } = req.body;
    const file = req.file; // ảnh upload (nếu có)

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Nếu có upload ảnh mới
    if (file) {
      // Nếu user có ảnh cũ thì xóa khỏi Cloudinary
      if (user.avatar_public_id) {
        await cloudinary.uploader.destroy(user.avatar_public_id);
      }

      // Upload ảnh mới lên Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "user_avatars",
        format: "jpg",
        transformation: [{ quality: "auto" }],
      });

      // Xóa file tạm local
      fs.unlink(file.path, (err) => {
        if (err) console.error("❌ Không thể xóa file tạm:", err);
      });

      // Gán thông tin ảnh mới
      user.avatar_url = result.secure_url;
      user.avatar_public_id = result.public_id;
    }

    // Cập nhật thông tin khác (nếu có)
    if (username) user.username = username;
    if (email) user.email = email;
    if (status) user.status = status; // chỉ nên cho admin update

    await user.save();

    res.json({
      success: true,
      message: "Cập nhật thông tin người dùng thành công",
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("❌ updateUser error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật người dùng",
      details: err.message,
    });
  }
};
// GET user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      where: { user_id: id },
      attributes: ["user_id", "username", "email", "avatar_url", "created_at"]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng."
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error("Error getUserById:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin người dùng."
    });
  }
};

exports.reportUser = async (req, res) => {
  try {
    const reported_user_id = req.params.user_id;
    const reporter_id = req.user.user_id;
    const { reason } = req.body;

    if (!reason) return res.status(400).json({ message: "reason is required" });

    const report = await UserReport.create({
      reporter_id,
      reported_user_id,
      reason,
    });

    res.json({ success: true, message: "Đã gửi báo cáo", report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUserReports = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const reports = await UserReport.findAll({
      where,
      include: [
        { model: User, as: "reporter", attributes: ["user_id", "username"] },
        { model: User, as: "reportedUser", attributes: ["user_id", "username"] },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resolveUserReport = async (req, res) => {
  try {
    const { admin_note, action } = req.body;

    const report = await UserReport.findByPk(req.params.id);

    if (!report) return res.status(404).json({ message: "Report not found" });

    // 1) Cập nhật trạng thái báo cáo
    report.status = "resolved";
    report.admin_note = admin_note;
    await report.save();

    // 2) Xử lý người dùng bị báo cáo
    const user = await User.findByPk(report.reported_user_id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (action === "warn") {
      user.warning_count = (user.warning_count || 0) + 1;
    }

    if (user.warning_count == 7) {
      user.banned_until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    if (user.warning_count == 10) {
      user.status = "ban";
    }
    if (action === "ban"){
      user.status = "ban";
    }

    await user.save();

    res.json({
      success: true,
      message: "Report resolved and user processed",
      report,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.rejectUserReport = async (req, res) => {
  try {
    const { admin_note } = req.body;
    const report = await UserReport.findByPk(req.params.id);

    if (!report) return res.status(404).json({ message: "Report not found" });

    report.status = "rejected";
    report.admin_note = admin_note;
    await report.save();

    res.json({ success: true, message: "Report rejected", report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
