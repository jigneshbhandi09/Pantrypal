require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect DB (serverless re-use friendly)
connectDB().catch(err => console.error('DB connect error:', err));

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*'
}));
app.use(express.json());

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
