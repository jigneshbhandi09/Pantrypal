const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getPantryItems,
  addPantryItem,
  updatePantryItem,
  deletePantryItem,
  getExpiringItems
} = require('../controllers/pantryController');

router.use(protect); // every route below this line requires a valid login

router.get('/', getPantryItems);
router.get('/expiring', getExpiringItems);
router.post('/', addPantryItem);
router.put('/:id', updatePantryItem);
router.delete('/:id', deletePantryItem);

module.exports = router;