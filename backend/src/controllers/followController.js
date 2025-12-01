const { Follow, User } = require("../models");

// Follow
exports.followUser = async (req, res) => {
  try {
    const follower_id = req.user.user_id; 
    const { following_id } = req.params;

    if (follower_id == following_id) {
      return res.status(400).json({ message: "Không thể tự theo dõi chính mình!" });
    }

    await Follow.create({ follower_id, following_id });

    res.json({ success: true, message: "Đã theo dõi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Unfollow
exports.unfollowUser = async (req, res) => {
  try {
    const follower_id = req.user.user_id; 
    const { following_id } = req.params;

    await Follow.destroy({
      where: { follower_id, following_id },
    });

    res.json({ success: true, message: "Đã bỏ theo dõi" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy danh sách tôi theo dõi
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const following = await Follow.findAll({
      where: { follower_id: userId },
      include: [
        {
          model: User,
          as: "following",
          attributes: ["user_id", "username", "avatar_url"]
        }
      ]
    });

    res.json({ success: true, data: following });
  } catch (err) {
    console.error("❌ getFollowing error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// Lấy danh sách người theo dõi tôi
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params; 
    console.log("Followers of:", userId);

    const followers = await Follow.findAll({
      where: { following_id: userId },
      include: [
        {
          model: User,
          as: "follower",
          attributes: ["user_id", "username", "avatar_url"]
        }
      ]
    });

    res.json({ success: true, data: followers });
  } catch (err) {
    console.error("❌ getFollowers error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Đếm số follower
exports.countFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const count = await Follow.count({ where: { following_id: id } });

    res.json({ success: true, count });
  } catch (err) {
    console.error("Error countFollowers:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Đếm số following
exports.countFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const count = await Follow.count({ where: { follower_id: id } });

    res.json({ success: true, count });
  } catch (err) {
    console.error("Error countFollowing:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
