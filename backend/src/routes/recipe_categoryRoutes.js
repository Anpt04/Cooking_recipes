const express = require('express');
const router = express.Router();
const controller = require('../controllers/recipe_categoryController');
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post('/', authMiddleware, controller.add);
router.get('/:recipe_id', controller.getByRecipe);
router.delete('/', authMiddleware, controller.delete);

module.exports = router;
