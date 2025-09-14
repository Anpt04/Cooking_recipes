const { RecipeStep, Recipe, RecipeImage } = require("../models");

// Lấy tất cả bước của 1 công thức
exports.getAllSteps = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const steps = await RecipeStep.findAll({
      where: { recipe_id: recipeId },
      order: [["step_number", "ASC"]],
      include: [{ model: RecipeImage }],
    });
    res.json(steps);
  } catch (error) {
    res.status(500).json({ message: "Error fetching steps", error: error.message });
  }
};

// Lấy chi tiết 1 bước
exports.getStepById = async (req, res) => {
  try {
    const { id } = req.params;
    const step = await RecipeStep.findByPk(id, {
      include: [{ model: RecipeImage }],
    });

    if (!step) return res.status(404).json({ message: "Step not found" });
    res.json(step);
  } catch (error) {
    res.status(500).json({ message: "Error fetching step", error: error.message });
  }
};

// Tạo bước mới
exports.createStep = async (req, res) => {
  try {
    const { recipe_id, step_number, instruction } = req.body;

    const recipe = await Recipe.findByPk(recipe_id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const step = await RecipeStep.create({ recipe_id, step_number, instruction });
    res.status(201).json(step);
  } catch (error) {
    res.status(500).json({ message: "Error creating step", error: error.message });
  }
};

// Cập nhật bước
exports.updateStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { step_number, instruction } = req.body;

    const step = await RecipeStep.findByPk(id);
    if (!step) return res.status(404).json({ message: "Step not found" });

    step.step_number = step_number ?? step.step_number;
    step.instruction = instruction ?? step.instruction;

    await step.save();
    res.json(step);
  } catch (error) {
    res.status(500).json({ message: "Error updating step", error: error.message });
  }
};

// Xóa bước
exports.deleteStep = async (req, res) => {
  try {
    const { id } = req.params;
    const step = await RecipeStep.findByPk(id);

    if (!step) return res.status(404).json({ message: "Step not found" });

    await step.destroy();
    res.json({ message: "Step deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting step", error: error.message });
  }
};