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

const recipe_stepRoutes = require('./routes/recipe_stepRoutes');
app.use("/api/recipe_step", recipe_stepRoutes);
module.exports = app;