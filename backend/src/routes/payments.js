const express = require('express');
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
  paystackWebhook,
  getMyTransactions,
  getMySales,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Webhook must use raw body — handled in index.js
router.post('/webhook', paystackWebhook);

router.post('/initialize', protect, initializePayment);
router.get('/verify', protect, verifyPayment);
router.get('/my-purchases', protect, getMyTransactions);
router.get('/my-sales', protect, getMySales);

module.exports = router;
