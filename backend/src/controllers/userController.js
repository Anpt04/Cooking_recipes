const { User } = require("../models");
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
