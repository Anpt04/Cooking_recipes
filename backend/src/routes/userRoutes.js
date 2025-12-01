const express = require("express");
const router = express.Router();
const { getProfile, updateUser, getUserById } = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/imgUpload");


// chỉ user đã đăng nhập mới được truy cập
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, upload.single("avatar"), updateUser);
router.get("/:id", getUserById);
module.exports = router;
