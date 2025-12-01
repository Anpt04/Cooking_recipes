// src/routes/recipeReportRoutes.js
const express = require("express");
const router = express.Router();
const {getAllReports, reportRecipe, rejectReport,resolveReport} = require("../controllers/recipeController");
const {authMiddleware} = require("../middlewares/authMiddleware");
const roleCheck = require("../middlewares/roleMiddleware"); // giả sử có

// user gửi report
router.post("/:id/report", authMiddleware, reportRecipe);

// admin routes
router.get("/admin/reports", authMiddleware, roleCheck("admin"), getAllReports);
router.put("/admin/reports/:id/resolve", authMiddleware, roleCheck("admin"), resolveReport);
router.put("/admin/reports/:id/reject", authMiddleware, roleCheck("admin"), rejectReport);

module.exports = router;
