"use strict";

const {
  MealPlanRecipe,
  Recipe,
  Ingredient,
  RecipeIngredient,
  ShoppingListItem,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");


const UNIT_BASE = {
  g: { base: "g", mul: 1 },
  kg: { base: "g", mul: 1000 },
  mg: { base: "g", mul: 0.001 },

  ml: { base: "ml", mul: 1 },
  l: { base: "ml", mul: 1000 },

  qua: { base: "qua", mul: 1 },
  tep: { base: "tep", mul: 1 },
  goi: { base: "goi", mul: 1 },
  la: { base: "la", mul: 1 },
  cay: { base: "cay", mul: 1 },
};

const UNIT_ALIASES = {
  g: ["g", "gram", "grams", "gr", "gam"],
  kg: ["kg", "kilogram"],
  mg: ["mg", "milligram"],
  ml: ["ml", "milliliter"],
  l: ["l", "liter", "litre"],
  qua: ["quả", "quả", "trái", "trái", "qa"],
  tep: ["tép", "tép", "tep"],
  goi: ["gói", "gói", "goi"],
  la: ["lá", "lá"],
  cay: ["cây", "cay"],
};

function canonicalUnit(unit) {
  if (!unit) return null;

  const u = String(unit).trim().toLowerCase();

  // match alias
  for (const [canon, list] of Object.entries(UNIT_ALIASES)) {
    if (list.includes(u)) return canon;
  }

  // if already canonical
  if (UNIT_BASE[u]) return u;

  return null;
}

function normalizeQty(qty, unit) {
  const canon = canonicalUnit(unit);
  if (!canon) return null;

  const base = UNIT_BASE[canon];
  return {
    qty: Number(qty) * base.mul,
    unit: base.base,
  };
}


exports.generateShoppingList = async (mealplan_id) => {
  return await sequelize.transaction(async (t) => {
    if (!mealplan_id) throw new Error("mealplan_id is required");

    // XÓA DANH SÁCH CŨ
    await ShoppingListItem.destroy({
      where: { mealplan_id },
      transaction: t,
    });

    // LẤY TẤT CẢ RECIPE CỦA MEALPLAN (CÓ THỂ TRÙNG)
    const links = await MealPlanRecipe.findAll({
      where: { mealplan_id },
      attributes: ["recipe_id"],
      transaction: t,
    });

    if (!links || links.length === 0) return [];

    // ĐẾM SỐ LẦN MỖI RECIPE XUẤT HIỆN TRONG MEALPLAN
    const recipeCount = {};
    const recipeIdsAll = [];

    for (const l of links) {
      const rid = l.recipe_id;
      recipeIdsAll.push(rid);
      recipeCount[rid] = (recipeCount[rid] || 0) + 1;
    }

    // LẤY DS RECIPE UNIQUE ĐỂ QUERY
    const recipeIds = [...new Set(recipeIdsAll)];

    // LẤY RECIPE + INGREDIENT
    const recipes = await Recipe.findAll({
      where: { recipe_id: recipeIds },
      include: [
        {
          model: Ingredient,
          as: "ingredients", // alias bạn đã đặt trong associate
          through: { model: RecipeIngredient, attributes: ["quantity"] },
        },
      ],
      transaction: t,
    });

    // GỘP THEO INGREDIENT_ID
    const aggregated = {}; // {ingredient_id: {quantity, unit}}

    for (const recipe of recipes) {
      const count = recipeCount[recipe.recipe_id] || 1;
      const ings = recipe.ingredients || [];

      for (const ing of ings) {
        const ingId = ing.ingredient_id;
        const rawQty = ing.RecipeIngredient?.quantity ?? "0";

        // Convert "1.000" → 1.000
        const qtyNum = parseFloat(String(rawQty).replace(",", ".")) || 0;

        const totalQty = qtyNum * count;
        const unit = ing.unit || "";

        if (!aggregated[ingId]) {
          aggregated[ingId] = {
            ingredient_id: ingId,
            quantity: 0,
            unit,
            name: ing.name,
          };
        }

        aggregated[ingId].quantity += totalQty;
      }
    }

    // TẠO DÒNG SHOPPING LIST
    const itemsToCreate = Object.values(aggregated);
    const created = [];

    for (const it of itemsToCreate) {
      const row = await ShoppingListItem.create(
        {
          mealplan_id,
          ingredient_id: it.ingredient_id,
          quantity: it.quantity,
          unit: it.unit,
          is_checked: false,
        },
        { transaction: t }
      );

      created.push(row);
    }

    return created;
  });
};
