const express = require('express');
const router = express.Router();
const {
  getAllItems,
  reviewItem,
  updateItemPrice,
  getAllTransactions,
  markDelivered,
  releaseFundsToSeller,
  getDashboardStats,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/items', getAllItems);
router.put('/items/:id/review', reviewItem);
router.put('/items/:id/price', updateItemPrice);
router.get('/transactions', getAllTransactions);
router.put('/transactions/:id/deliver', markDelivered);
router.put('/transactions/:id/release-funds', releaseFundsToSeller);

module.exports = router;
