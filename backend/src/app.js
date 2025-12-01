const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models'); 


const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const categoryRoutes = require("./routes/categoryRoutes");
app.use("/api/categories", categoryRoutes);

const recipeRoutes = require('./routes/recipeRoutes');
app.use("/api/recipes", recipeRoutes);
app.use("/api/admin", recipeRoutes);

const recipe_stepRoutes = require('./routes/recipe_stepRoutes');
app.use("/api/recipe_step", recipe_stepRoutes);

const recipe_imageRoutes = require('./routes/recipe_imageRoutes.js');
app.use("/api/recipe_images", recipe_imageRoutes);

const userRoutes = require("./routes/userRoutes.js"); 
app.use("/api/users", userRoutes);

const favoriteRoutes = require("./routes/favoriteRoutes");
app.use("/api/favorites", favoriteRoutes);

const followRoutes = require("./routes/followRoutes");
app.use("/api/follow", followRoutes);

const rateRoutes = require("./routes/rateRoutes");
app.use("/api/rates", rateRoutes);
app.use("/api/rate", rateRoutes);

const ingredientRoutes = require("./routes/ingredientRoutes");
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/admin/ingredients", ingredientRoutes);

const recipeIngredientRoutes = require("./routes/recipe_ingredientRoutes");
app.use("/api/recipe-ingredients", recipeIngredientRoutes);

const recipeCategoryRoutes = require('./routes/recipe_categoryRoutes');
app.use('/api/recipe-categories', recipeCategoryRoutes);

const recipeReportRoutes = require("./routes/recipeReportRoutes");
app.use("/api/recipes", recipeReportRoutes);

const userReportRoutes = require("./routes/userReportRoutes");
app.use("/api/user-reports", userReportRoutes);

const mealPlanRoutes = require("./routes/mealPlanRoutes");
app.use("/api/meal-plans", mealPlanRoutes);

const shoppingListRoutes = require("./routes/shoppingListRoutes");
app.use("/api/shopping-list", shoppingListRoutes);
module.exports = app;