const mongoose = require('mongoose');
const { Schema } = mongoose;

const groceryListSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  weekOf: { type: Date, required: true },
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    checked: { type: Boolean, default: false }
  }]
}, { timestamps: true });

groceryListSchema.index({ userId: 1, weekOf: 1 }, { unique: true });

module.exports = mongoose.model('GroceryList', groceryListSchema);