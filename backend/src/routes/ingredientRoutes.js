// routes/ingredientRoutes.js
const express = require("express");
const {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getAllRequests,
  approveRequest,
  rejectRequest,
  requestIngredient
} = require("../controllers/ingredientController");

const { authMiddleware } = require("../middlewares/authMiddleware");
const roleCheck = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/requests", authMiddleware, roleCheck("admin"), getAllRequests);
router.put("/requests/:id/approve", authMiddleware, roleCheck("admin"), approveRequest);
router.put("/requests/:id/reject", authMiddleware, roleCheck("admin"), rejectRequest);

// 🟢 Public routes
router.get("/", getAllIngredients);
router.get("/:id", getIngredientById);

router.post("/request", authMiddleware, requestIngredient);

// 🔒 Admin routes
router.post("/", authMiddleware, roleCheck("admin"), createIngredient);
router.put("/:id", authMiddleware, roleCheck("admin"), updateIngredient);
router.delete("/:id", authMiddleware, roleCheck("admin"), deleteIngredient);



module.exports = router;
