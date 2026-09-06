const GroceryList = require('../models/GroceryList');
const MealPlan = require('../models/MealPlan');
const PantryItem = require('../models/PantryItem');

// Helper to normalize start of week date
const getNormalizedWeek = (weekOfParam) => {
  const date = weekOfParam ? new Date(weekOfParam) : new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

// GET /api/grocerylist?weekOf=YYYY-MM-DD
exports.getGroceryList = async (req, res) => {
  try {
    const weekOf = getNormalizedWeek(req.query.weekOf);
    let list = await GroceryList.findOne({ userId: req.user._id, weekOf });

    if (!list) {
      list = await GroceryList.create({ userId: req.user._id, weekOf, items: [] });
    }

    res.status(200).json({
      message: 'Grocery list fetched successfully',
      data: list
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch grocery list', error: err.message });
  }
};

// POST /api/grocerylist/generate — build list from that week's meal plan, subtracting pantry items
exports.generateGroceryList = async (req, res) => {
  try {
    const weekOf = getNormalizedWeek(req.body.weekOf);
    const endDate = new Date(weekOf);
    endDate.setDate(endDate.getDate() + 7);

    // 1. Get meal plans for week
    const mealPlans = await MealPlan.find({
      userId: req.user._id,
      date: { $gte: weekOf, $lt: endDate }
    }).populate('recipeId');

    // 2. Aggregate required ingredients
    const neededMap = new Map(); // key: "name|unit" -> quantity
    for (const plan of mealPlans) {
      if (plan.recipeId && Array.isArray(plan.recipeId.ingredients)) {
        for (const ing of plan.recipeId.ingredients) {
          const key = `${ing.name.toLowerCase().trim()}|${(ing.unit || 'pcs').toLowerCase().trim()}`;
          const current = neededMap.get(key) || { name: ing.name.trim(), quantity: 0, unit: ing.unit || 'pcs' };
          current.quantity += (Number(ing.quantity) || 1);
          neededMap.set(key, current);
        }
      }
    }

    // 3. Subtract pantry items
    const pantryItems = await PantryItem.find({ userId: req.user._id });
    for (const pItem of pantryItems) {
      const pKey = `${pItem.name.toLowerCase().trim()}|${(pItem.unit || 'pcs').toLowerCase().trim()}`;
      if (neededMap.has(pKey)) {
        const needed = neededMap.get(pKey);
        needed.quantity = Math.max(0, needed.quantity - (Number(pItem.quantity) || 0));
        neededMap.set(pKey, needed);
      }
    }

    // Filter out 0 quantities
    const generatedItems = [];
    neededMap.forEach((val) => {
      if (val.quantity > 0) {
        generatedItems.push({
          name: val.name,
          quantity: Math.round(val.quantity * 100) / 100,
          unit: val.unit,
          checked: false
        });
      }
    });

    // 4. Preserve existing checked status if item already existed
    const existingList = await GroceryList.findOne({ userId: req.user._id, weekOf });
    if (existingList && existingList.items) {
      const checkedSet = new Set(
        existingList.items.filter(i => i.checked).map(i => i.name.toLowerCase().trim())
      );
      generatedItems.forEach(item => {
        if (checkedSet.has(item.name.toLowerCase().trim())) {
          item.checked = true;
        }
      });
    }

    const updatedList = await GroceryList.findOneAndUpdate(
      { userId: req.user._id, weekOf },
      { items: generatedItems },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Grocery list generated successfully',
      data: updatedList
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate grocery list', error: err.message });
  }
};

// PUT /api/grocerylist/items/:itemId — toggle checked status or edit item
exports.updateGroceryListItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { checked, name, quantity, unit, weekOf } = req.body;
    const weekDate = getNormalizedWeek(weekOf);

    const list = await GroceryList.findOne({ userId: req.user._id, weekOf: weekDate });
    if (!list) {
      return res.status(404).json({ message: 'Grocery list not found' });
    }

    const item = list.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Grocery item not found' });
    }

    if (typeof checked === 'boolean') item.checked = checked;
    if (name) item.name = name;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (unit) item.unit = unit;

    await list.save();
    res.status(200).json({
      message: 'Grocery list item updated successfully',
      data: list
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update grocery list item', error: err.message });
  }
};

// POST /api/grocerylist/items — manually add an item
exports.addGroceryListItem = async (req, res) => {
  try {
    const { name, quantity, unit, weekOf } = req.body;
    if (!name || quantity === undefined || !unit) {
      return res.status(400).json({ message: 'name, quantity, and unit are required' });
    }

    const weekDate = getNormalizedWeek(weekOf);
    let list = await GroceryList.findOne({ userId: req.user._id, weekOf: weekDate });

    if (!list) {
      list = await GroceryList.create({ userId: req.user._id, weekOf: weekDate, items: [] });
    }

    list.items.push({ name, quantity: Number(quantity), unit, checked: false });
    await list.save();

    res.status(201).json({
      message: 'Item added to grocery list successfully',
      data: list
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add item to grocery list', error: err.message });
  }
};

// DELETE /api/grocerylist/items/:itemId — remove an item
exports.deleteGroceryListItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const weekDate = getNormalizedWeek(req.query.weekOf);

    const list = await GroceryList.findOne({ userId: req.user._id, weekOf: weekDate });
    if (!list) {
      return res.status(404).json({ message: 'Grocery list not found' });
    }

    list.items.pull(itemId);
    await list.save();

    res.status(200).json({
      message: 'Grocery item deleted successfully',
      data: list
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete grocery list item', error: err.message });
  }
};
