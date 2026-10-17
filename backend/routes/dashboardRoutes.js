const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getWarrantyStats,
  getCategoryStats,
  getUpcomingItems,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All dashboard routes are protected
router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/warranty-stats', getWarrantyStats);
router.get('/category-stats', getCategoryStats);
router.get('/upcoming-items', getUpcomingItems);

module.exports = router;
