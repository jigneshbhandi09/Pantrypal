const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getGroceryList,
  generateGroceryList,
  updateGroceryListItem,
  addGroceryListItem,
  deleteGroceryListItem
} = require('../controllers/groceryListController');

router.use(protect);

router.get('/', getGroceryList);
router.post('/generate', generateGroceryList);
router.post('/items', addGroceryListItem);
router.put('/items/:itemId', updateGroceryListItem);
router.delete('/items/:itemId', deleteGroceryListItem);

module.exports = router;

