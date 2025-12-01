const express = require("express");
const router = express.Router();

const {reportUser, getAllUserReports, rejectUserReport, resolveUserReport} = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const roleCheck = require("../middlewares/roleMiddleware");

router.post("/:user_id",authMiddleware,reportUser);

router.get("/",authMiddleware,roleCheck("admin"),getAllUserReports);

router.patch("/:id/reject",authMiddleware,roleCheck("admin"),rejectUserReport);

router.patch("/:id/resolve",authMiddleware,roleCheck("admin"),resolveUserReport);

module.exports = router;
