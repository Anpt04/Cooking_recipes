const { Follow, User } = require("../models");

// 🟢 Theo dõi một người dùng
// POST /api/follows
// body: { follower_id, following_id }
exports.followUser = async (req, res) => {
  try {
    const { follower_id, following_id } = req.body;

    if (follower_id === following_id) {
      return res.status(400).json({ success: false, message: "Không thể tự theo dõi chính mình." });
    }

    const exists = await Follow.findOne({ where: { follower_id, following_id } });
    if (exists) {
      return res.status(400).json({ success: false, message: "Bạn đã theo dõi người này rồi." });
    }

    const follow = await Follow.create({ follower_id, following_id });
    res.status(201).json({ success: true, message: "Theo dõi thành công.", data: follow });
  } catch (error) {
    console.error("❌ Lỗi khi theo dõi:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi theo dõi.", details: error.message });
  }
};

// 🔴 Hủy theo dõi
// DELETE /api/follows/:follower_id/:following_id
exports.unfollowUser = async (req, res) => {
  try {
    const { follower_id, following_id } = req.params;

    const follow = await Follow.findOne({ where: { follower_id, following_id } });
    if (!follow) {
      return res.status(404).json({ success: false, message: "Bạn chưa theo dõi người này." });
    }

    await follow.destroy();
    res.json({ success: true, message: "Đã hủy theo dõi." });
  } catch (error) {
    console.error("❌ Lỗi khi hủy theo dõi:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi hủy theo dõi.", details: error.message });
  }
};

// 👥 Lấy danh sách người mà user đang theo dõi
// GET /api/follows/following/:user_id
exports.getFollowing = async (req, res) => {
  try {
    const { user_id } = req.params;

    const following = await Follow.findAll({
      where: { follower_id: user_id },
      include: [
        { model: User, as: "FollowingUser", attributes: ["user_id", "username", "email"] },
      ],
    });

    res.json({ success: true, data: following.map(f => f.FollowingUser) });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách đang theo dõi:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách đang theo dõi.", details: error.message });
  }
};

// 👤 Lấy danh sách người theo dõi user
// GET /api/follows/followers/:user_id
exports.getFollowers = async (req, res) => {
  try {
    const { user_id } = req.params;

    const followers = await Follow.findAll({
      where: { following_id: user_id },
      include: [
        { model: User, as: "FollowerUser", attributes: ["user_id", "username", "email"] },
      ],
    });

    res.json({ success: true, data: followers.map(f => f.FollowerUser) });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách người theo dõi:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách người theo dõi.", details: error.message });
  }
};
