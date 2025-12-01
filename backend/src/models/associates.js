'use strict';

module.exports = (db) => {
  const {
    User,
    Category,
    Recipe,
    RecipeStep,
    RecipeImage,
    Ingredient,
    RecipeIngredient,
    Favorite,
    Rate,
    RecipeCategory, 
    Follow,
    RateReport,
    IngredientRequest,
    RecipeReport,
    UserReport,
    MealPlan,
    MealPlanRecipe,
    ShoppingListItem
  } = db;

  // User - Recipe (1-N)
  User.hasMany(Recipe, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  Recipe.belongsTo(User, { foreignKey: 'user_id' });

  // Recipe - RecipeStep (1-N)
  Recipe.hasMany(RecipeStep, { foreignKey: 'recipe_id', onDelete: 'CASCADE' });
  RecipeStep.belongsTo(Recipe, { foreignKey: 'recipe_id' });

  // Recipe - RecipeImage (1-N)
  Recipe.hasMany(RecipeImage, { foreignKey: 'recipe_id', onDelete: 'CASCADE' });
  RecipeImage.belongsTo(Recipe, { foreignKey: 'recipe_id' });

  // RecipeStep - RecipeImage (1-N) (ảnh cho từng bước)
  RecipeStep.hasMany(RecipeImage, { foreignKey: 'step_id', onDelete: 'CASCADE' });
  RecipeImage.belongsTo(RecipeStep, { foreignKey: 'step_id' });

  // Recipe - Ingredient (N-N qua RecipeIngredient)
  Recipe.belongsToMany(Ingredient, {
    through: RecipeIngredient,
    foreignKey: 'recipe_id',
    otherKey: 'ingredient_id',
    as: 'ingredients',
    onDelete: 'CASCADE',
  });
  Ingredient.belongsToMany(Recipe, {
    through: RecipeIngredient,
    foreignKey: 'ingredient_id',
    otherKey: 'recipe_id',
    as: 'recipes',
    onDelete: 'CASCADE',
  });
  RecipeIngredient.belongsTo(Ingredient, { foreignKey: 'ingredient_id', as: 'ingredient' });
  RecipeIngredient.belongsTo(Recipe, { foreignKey: 'recipe_id', as: 'recipe' });
  Ingredient.hasMany(RecipeIngredient, { foreignKey: 'ingredient_id', as: 'recipeIngredients' });
  Recipe.hasMany(RecipeIngredient, { foreignKey: 'recipe_id', as: 'recipeIngredients' });

  // User - Favorite (N-N qua Favorite)
  User.hasMany(Favorite, { foreignKey: "user_id", as: "favorites" });
  Favorite.belongsTo(User, { foreignKey: "user_id", as: "user" });

  Recipe.hasMany(Favorite, { foreignKey: "recipe_id", as: "favorites" });
  Favorite.belongsTo(Recipe, { foreignKey: "recipe_id", as: "recipe" });

  // User - Rate (N-N qua Rate)
  User.belongsToMany(Recipe, {
    through: Rate,
    foreignKey: 'user_id',
    otherKey: 'recipe_id',
    onDelete: 'CASCADE',
    as: 'Ratings',
  });
  Recipe.belongsToMany(User, {
    through: Rate,
    foreignKey: 'recipe_id',
    otherKey: 'user_id',
    onDelete: 'CASCADE',
    as: 'RatedBy',
  });


  // Recipe <-> Category (N-N)
  Recipe.belongsToMany(Category, {
    through: RecipeCategory,
    foreignKey: 'recipe_id',
    otherKey: 'category_id',
    as: "categories"
  });
    Category.belongsToMany(Recipe, {
    through: RecipeCategory,
    foreignKey: 'category_id',
    otherKey: 'recipe_id'
  });

  Follow.belongsTo(User, {
    foreignKey: "follower_id",
    as: "follower"
  });

  Follow.belongsTo(User, {
    foreignKey: "following_id",
    as: "following"
  });

  User.hasMany(Rate, { foreignKey: 'user_id', as: 'rates' });
  Rate.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Recipe – Rate (nếu có)
  Recipe.hasMany(Rate, { foreignKey: 'recipe_id', as: 'rates' });
  Rate.belongsTo(Recipe, { foreignKey: 'recipe_id', as: 'recipe' });
  
  RateReport.belongsTo(Rate, { foreignKey: "rate_id" });
  RateReport.belongsTo(Rate, {
    foreignKey: "rate_id",
    as: "rate",
  });

  RateReport.belongsTo(User, {
    foreignKey: "reporter_id",
    as: "reporter"
  });

  User.hasMany(RateReport, {
    foreignKey: "reporter_id",
    as: "reports_sent"
  });
 
  IngredientRequest.belongsTo(User, { foreignKey: "user_id" });

  RecipeReport.belongsTo(Recipe, { foreignKey: "recipe_id", as: "recipe" });
  RecipeReport.belongsTo(User, { foreignKey: "reporter_id", as: "reporter" });

  UserReport.belongsTo(User, { as: "reporter", foreignKey: "reporter_id" });
  UserReport.belongsTo(User, { as: "reportedUser", foreignKey: "reported_user_id" });

   User.hasMany(MealPlan, { foreignKey: 'user_id' });
  MealPlan.belongsTo(User, { foreignKey: 'user_id' });

  MealPlan.belongsToMany(Recipe, {
    through: MealPlanRecipe,
    foreignKey: 'mealplan_id',
    otherKey: 'recipe_id',
    as: 'recipes',
    onDelete: 'CASCADE',
    hooks: true,
  });

  Recipe.belongsToMany(MealPlan, {
    through: MealPlanRecipe,
    foreignKey: 'recipe_id',
    otherKey: 'mealplan_id',
    as: 'mealplans',
    onDelete: 'CASCADE',
    hooks: true,
  });

  MealPlanRecipe.belongsTo(MealPlan, {
    foreignKey: 'mealplan_id',
    onDelete: 'CASCADE',
    hooks: true,
  });

  MealPlanRecipe.belongsTo(Recipe, {
    foreignKey: 'recipe_id',
    onDelete: 'CASCADE',
    hooks: true,
  });

  MealPlan.hasMany(MealPlanRecipe, {
    foreignKey: 'mealplan_id',
    onDelete: 'CASCADE',
    hooks: true,
  });

  Recipe.hasMany(MealPlanRecipe, {
    foreignKey: 'recipe_id',
    onDelete: 'CASCADE',
    hooks: true,
  });

  // 📌 ShoppingListItem - MealPlan & Ingredient
  MealPlan.hasMany(ShoppingListItem, { foreignKey: 'mealplan_id' });
  ShoppingListItem.belongsTo(MealPlan, { foreignKey: 'mealplan_id' });

  Ingredient.hasMany(ShoppingListItem, { foreignKey: 'ingredient_id' });
  ShoppingListItem.belongsTo(Ingredient, { foreignKey: 'ingredient_id', as: "Ingredient"  });
};
