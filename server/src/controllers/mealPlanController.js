const MealPlan = require('../models/MealPlan');

// GET /api/mealplan?week=YYYY-MM-DD
exports.getMealPlan = async (req, res) => {
  try {
    let startDate;
    if (req.query.week) {
      startDate = new Date(req.query.week);
    } else {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
      startDate = new Date(now.setDate(diff));
    }
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const mealPlans = await MealPlan.find({
      userId: req.user._id,
      date: { $gte: startDate, $lt: endDate }
    }).populate('recipeId');

    res.status(200).json({
      message: 'Meal plan fetched successfully',
      data: mealPlans
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch meal plan', error: err.message });
  }
};

// POST /api/mealplan — assign/upsert a recipe to a date and mealType
exports.saveMealPlanSlot = async (req, res) => {
  try {
    const { date, mealType, recipeId } = req.body;

    if (!date || !mealType || !recipeId) {
      return res.status(400).json({ message: 'date, mealType, and recipeId are required' });
    }

    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);

    const updatedSlot = await MealPlan.findOneAndUpdate(
      { userId: req.user._id, date: slotDate, mealType },
      { recipeId },
      { new: true, upsert: true, runValidators: true }
    ).populate('recipeId');

    res.status(200).json({
      message: 'Meal plan slot saved successfully',
      data: updatedSlot
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save meal plan slot', error: err.message });
  }
};

// DELETE /api/mealplan/:id — remove meal plan item
exports.deleteMealPlanSlot = async (req, res) => {
  try {
    const deleted = await MealPlan.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Meal plan slot not found' });
    }

    res.status(200).json({ message: 'Meal plan slot removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete meal plan slot', error: err.message });
  }
};
