const mongoose = require('mongoose');
const { Schema } = mongoose;

const recipeSchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, trim: true },
  ingredients: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }
  }],
  instructions: [{ type: String, required: true }],
  cuisine: { type: String, trim: true },
  dietTags: [{ type: String, enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'] }],
  prepTimeMinutes: { type: Number, min: 0 },
  cookTimeMinutes: { type: Number, min: 0 },
  servings: { type: Number, min: 1, default: 2 },
  imageUrl: { type: String, default: null },
  isAiGenerated: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

recipeSchema.index({ title: 'text', cuisine: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);