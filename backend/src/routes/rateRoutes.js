// routes/rateRoutes.js
const express = require("express");
const {
  addOrUpdateRate,
  getRatesByRecipe,
  deleteRate,
  getAllReports,
  approveRateReport,
  rejectRateReport,
  reportComment
} = require("../controllers/rateController");

const { authMiddleware } = require("../middlewares/authMiddleware");
const roleCheck = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/:id/report", authMiddleware, reportComment);

// Admin only
router.get("/admin/rate-reports", authMiddleware, roleCheck("admin"), getAllReports );
router.put("/admin/rate-reports/:id/approve", authMiddleware, roleCheck("admin"), approveRateReport);
router.put("/admin/rate-reports/:id/reject", authMiddleware, roleCheck("admin"), rejectRateReport);

// 🟢 Thêm hoặc cập nhật đánh giá
router.post("/", authMiddleware, addOrUpdateRate);

// 🟡 Lấy danh sách đánh giá của 1 công thức
router.get("/recipe/:recipe_id", getRatesByRecipe);

// 🔴 Xóa đánh giá
router.delete("/:user_id/:recipe_id", authMiddleware, deleteRate);

module.exports = router;
