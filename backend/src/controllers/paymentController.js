const axios = require('axios');
const crypto = require('crypto');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');

const PAYSTACK_SECRET = () => process.env.PAYSTACK_SECRET_KEY;

exports.initializePayment = async (req, res) => {
  try {
    if (!PAYSTACK_SECRET()) {
      return res.status(500).json({ message: 'Payment service not configured' });
    }

    const { itemId } = req.body;
    const item = await Item.findById(itemId).populate('seller');

    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (!item.isPublished || item.status !== 'approved') {
      return res.status(400).json({ message: 'Item is not available for purchase' });
    }
    if (item.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot buy your own item' });
    }
    if (!item.totalAmount || item.totalAmount <= 0) {
      return res.status(400).json({ message: 'Item price has not been set by admin yet' });
    }

    const reference = `SELL_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const amountInKobo = item.totalAmount * 100;

    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: req.user.email,
        amount: amountInKobo,
        reference,
        metadata: {
          itemId: item._id.toString(),
          buyerId: req.user._id.toString(),
          sellerId: item.seller._id.toString(),
          itemTitle: item.title,
        },
        callback_url: `${process.env.FRONTEND_URL}/payment/verify?reference=${reference}`,
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET()}` } }
    );

    // Create a pending transaction record
    await Transaction.create({
      buyer: req.user._id,
      seller: item.seller._id,
      item: item._id,
      itemPrice: item.finalPrice,
      platformFee: item.platformFee,
      totalAmount: item.totalAmount,
      paymentReference: reference,
      status: 'pending',
      paymentStatus: 'pending',
    });

    res.json({
      authorization_url: paystackRes.data.data.authorization_url,
      reference,
      amount: item.totalAmount,
    });
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    res.status(500).json({ message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) return res.status(400).json({ message: 'Reference is required' });

    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET()}` } }
    );

    const { status, amount, metadata } = paystackRes.data.data;

    const transaction = await Transaction.findOne({ paymentReference: reference });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (status === 'success') {
      transaction.paymentStatus = 'success';
      transaction.status = 'paid';
      transaction.paystackReference = paystackRes.data.data.reference;
      transaction.paidAt = new Date();
      await transaction.save();

      // Mark item as no longer available
      await Item.findByIdAndUpdate(transaction.item, {
        buyer: transaction.buyer,
        isPublished: false,
      });

      return res.json({
        success: true,
        message: 'Payment verified successfully',
        transaction,
      });
    }

    transaction.paymentStatus = 'failed';
    transaction.status = 'failed';
    await transaction.save();

    res.json({ success: false, message: 'Payment was not successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.paystackWebhook = async (req, res) => {
  try {
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET())
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const { event, data } = req.body;

    if (event === 'charge.success') {
      const transaction = await Transaction.findOne({ paymentReference: data.reference });
      if (transaction && transaction.paymentStatus !== 'success') {
        transaction.paymentStatus = 'success';
        transaction.status = 'paid';
        transaction.paystackReference = data.reference;
        transaction.paidAt = new Date();
        await transaction.save();

        await Item.findByIdAndUpdate(transaction.item, {
          buyer: transaction.buyer,
          isPublished: false,
        });
      }
    }

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { buyer: req.user._id };

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('item', 'title images')
      .populate('seller', 'name phone')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ transactions, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMySales = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { seller: req.user._id, paymentStatus: 'success' };

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('item', 'title images')
      .populate('buyer', 'name phone')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ transactions, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
