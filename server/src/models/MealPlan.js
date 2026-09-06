const mongoose = require('mongoose');
const { Schema } = mongoose;

const mealPlanSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true }
}, { timestamps: true });

mealPlanSchema.index({ userId: 1, date: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);