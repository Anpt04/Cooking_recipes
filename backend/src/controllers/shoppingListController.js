const { ShoppingListItem, Ingredient } = require("../models");
const shoppingListService = require("../services/shoppingListService");


exports.addShoppingItem = async (req, res) => {
  try {
    let { mealplan_id, ingredient_id, quantity, unit } = req.body;

    // Normalize quantity
    if (quantity === "" || quantity === null || quantity === undefined) {
      quantity = 0;
    }

    quantity = Number(quantity); // ép về số
    if (isNaN(quantity)) quantity = 0;

    // Normalize unit
    unit = unit || ""; // nếu null → ""

    const newItem = await ShoppingListItem.create({
      mealplan_id,
      ingredient_id,
      quantity,
      unit,
    });

    res.status(201).json(newItem);
  } catch (err) {
    console.error("❌ addShoppingItem ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};



exports.toggleChecked = async (req, res) => {
  try {
    const item = await ShoppingListItem.findByPk(req.params.item_id);
    if (!item) return res.status(404).json({ message: "Không tìm thấy" });

    item.is_checked = !item.is_checked;
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteShoppingItem = async (req, res) => {
  try {
    const item = await ShoppingListItem.findByPk(req.params.item_id);
    if (!item) return res.status(404).json({ message: "Không tìm thấy" });

    await item.destroy();

    res.json({ message: "Đã xoá" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generateShoppingList = async (req, res) => {
  try {
    const { mealplan_id } = req.params;

    const result = await shoppingListService.generateShoppingList(mealplan_id);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Generate shopping list error:", err);
    res.status(500).json({ success: false });
  }
};



exports.getShoppingList = async (req, res) => {
  try {
    const { mealplan_id } = req.params;

    const items = await ShoppingListItem.findAll({
      where: { mealplan_id },
      include: [
        {
          model: Ingredient,
          as: "Ingredient", 
          attributes: ["ingredient_id", "name", "unit"]
        }
      ]
    });

    res.json(items);
  } catch (err) {
    console.error("❌ getShoppingList ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
