const express = require("express");
const router = express.Router();

const {
  getShoppingList,
  addShoppingItem,
  toggleChecked,
  deleteShoppingItem,
  generateShoppingList, 
} = require("../controllers/shoppingListController");

// Lấy danh sách
router.get("/:mealplan_id", getShoppingList);

// Thêm item thủ công
router.post("/", addShoppingItem);

// Toggle check
router.patch("/toggle/:item_id", toggleChecked);

// Xóa item
router.delete("/:item_id", deleteShoppingItem);

// ⭐ Tạo shopping list từ MealPlan 
router.post("/generate/:mealplan_id", generateShoppingList);

module.exports = router;
