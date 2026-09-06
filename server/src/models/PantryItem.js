const mongoose = require('mongoose');
const { Schema } = mongoose;

const pantryItemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['produce', 'dairy', 'grain', 'protein', 'spice', 'condiment', 'frozen', 'other'],
    default: 'other'
  },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, enum: ['g', 'kg', 'ml', 'l', 'pcs', 'tbsp', 'tsp', 'cup'], required: true },
  expiryDate: { type: Date, index: true },
  purchaseDate: { type: Date, default: Date.now }
}, { timestamps: true });

pantryItemSchema.index({ userId: 1, expiryDate: 1 });

module.exports = mongoose.model('PantryItem', pantryItemSchema);