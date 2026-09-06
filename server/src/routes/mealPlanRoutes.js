const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getMealPlan,
  saveMealPlanSlot,
  deleteMealPlanSlot
} = require('../controllers/mealPlanController');

router.use(protect);

router.get('/', getMealPlan);
router.post('/', saveMealPlanSlot);
router.delete('/:id', deleteMealPlanSlot);

module.exports = router;

