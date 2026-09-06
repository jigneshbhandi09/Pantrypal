require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*'
}));
app.use(express.json());

// Ensure MongoDB is connected before processing any API request
app.use(async (req, res, next) => {
  if (req.path === '/api/health') return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error in middleware:', err.message);
    res.status(500).json({
      message: 'Database connection failed. Please verify MONGO_URI in Vercel settings and ensure MongoDB Atlas IP Whitelist includes 0.0.0.0/0.',
      error: err.message
    });
  }
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const pantryRoutes = require('./routes/pantryRoutes');
app.use('/api/pantry', pantryRoutes);

const recipeRoutes = require('./routes/recipeRoutes');
app.use('/api/recipes', recipeRoutes);

const mealPlanRoutes = require('./routes/mealPlanRoutes');
app.use('/api/mealplan', mealPlanRoutes);

const groceryListRoutes = require('./routes/groceryListRoutes');
app.use('/api/grocerylist', groceryListRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'PantryPal API is healthy' }));

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
