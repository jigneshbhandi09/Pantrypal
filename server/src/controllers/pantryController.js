const PantryItem = require('../models/PantryItem');

// GET /api/pantry — list all pantry items for the logged-in user
exports.getPantryItems = async (req, res) => {
  try {
    const items = await PantryItem.find({ userId: req.user._id }).sort({ expiryDate: 1 });
    res.status(200).json({
      message: 'Pantry items fetched successfully',
      data: items
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pantry items', error: err.message });
  }
};

// POST /api/pantry — add a new pantry item
exports.addPantryItem = async (req, res) => {
  try {
    const { name, category, quantity, unit, expiryDate } = req.body;

    if (!name || !quantity || !unit) {
      return res.status(400).json({ message: 'name, quantity, and unit are required' });
    }

    const item = await PantryItem.create({
      userId: req.user._id,
      name,
      category,
      quantity,
      unit,
      expiryDate
    });

    res.status(201).json({
      message: 'Pantry item added successfully',
      data: item
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add pantry item', error: err.message });
  }
};

// PUT /api/pantry/:id — update a pantry item
exports.updatePantryItem = async (req, res) => {
  try {
    const item = await PantryItem.findOne({ _id: req.params.id, userId: req.user._id });

    if (!item) {
      return res.status(404).json({ message: 'Pantry item not found' });
    }

    Object.assign(item, req.body);
    await item.save();

    res.status(200).json({
      message: 'Pantry item updated successfully',
      data: item
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update pantry item', error: err.message });
  }
};

// DELETE /api/pantry/:id — remove a pantry item
exports.deletePantryItem = async (req, res) => {
  try {
    const item = await PantryItem.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!item) {
      return res.status(404).json({ message: 'Pantry item not found' });
    }

    res.status(200).json({ message: 'Pantry item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete pantry item', error: err.message });
  }
};

// GET /api/pantry/expiring — items expiring within 7 days
exports.getExpiringItems = async (req, res) => {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const items = await PantryItem.find({
      userId: req.user._id,
      expiryDate: { $lte: sevenDaysFromNow }
    }).sort({ expiryDate: 1 });

    res.status(200).json({
      message: 'Expiring pantry items fetched successfully',
      data: items
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch expiring items', error: err.message });
  }
};