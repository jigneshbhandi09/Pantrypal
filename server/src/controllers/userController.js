const User = require('../models/User');

// GET /api/user/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      message: 'Profile fetched successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        dietaryPreferences: user.dietaryPreferences || [],
        allergies: user.allergies || [],
        avatarUrl: user.avatarUrl
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user profile', error: err.message });
  }
};

// PUT /api/user/profile — update name, dietaryPreferences, allergies
exports.updateProfile = async (req, res) => {
  try {
    const { name, dietaryPreferences, allergies, avatarUrl } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) user.name = name.trim();
    if (Array.isArray(dietaryPreferences)) user.dietaryPreferences = dietaryPreferences;
    if (Array.isArray(allergies)) user.allergies = allergies;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        dietaryPreferences: user.dietaryPreferences,
        allergies: user.allergies,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user profile', error: err.message });
  }
};
