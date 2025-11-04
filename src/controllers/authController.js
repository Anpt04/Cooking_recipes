// src/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

// 🔹 Đăng ký
exports.register = async (req, res) => {
  try {
    const { username, email, password, avatar_url } = req.body;

    // Kiểm tra email tồn tại
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Kiểm tra username tồn tại
    // const existingUsername = await User.findOne({ where: { username } });
    // if (existingUsername) {
    //   return res.status(400).json({ message: "Username đã tồn tại" });
    // }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      avatar_url: avatar_url || null,
    });

    return res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        user_id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        avatar_url: newUser.avatar_url,
        created_at: newUser.created_at,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi register:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// 🔹 Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Sai email hoặc mật khẩu" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai email hoặc mật khẩu" });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET ,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Đăng nhập thành công",
      token,
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
  } catch (error) {
    console.error("❌ Lỗi login:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
