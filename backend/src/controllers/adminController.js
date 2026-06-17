const Item = require('../models/Item');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.getAllItems = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('seller', 'name email phone')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      items,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reviewItem = async (req, res) => {
  try {
    const { status, finalPrice, adminNotes, rejectionReason } = req.body;
    const item = await Item.findById(req.params.id).populate('seller', 'name email');

    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (!['approved', 'rejected', 'under_review'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    item.status = status;
    item.adminNotes = adminNotes;

    if (status === 'approved') {
      if (!finalPrice) return res.status(400).json({ message: 'Final price is required for approval' });
      const price = Number(finalPrice);
      item.finalPrice = price;
      item.platformFee = Math.round(price * 0.1);
      item.totalAmount = price + item.platformFee;
      item.isPublished = true;
      item.verifiedAt = new Date();
    }

    if (status === 'rejected') {
      item.rejectionReason = rejectionReason;
      item.isPublished = false;
    }

    await item.save();
    res.json({ message: `Item ${status} successfully`, item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateItemPrice = async (req, res) => {
  try {
    const { finalPrice } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.status !== 'approved') return res.status(400).json({ message: 'Item must be approved first' });

    const price = Number(finalPrice);
    item.finalPrice = price;
    item.platformFee = Math.round(price * 0.1);
    item.totalAmount = price + item.platformFee;
    await item.save();

    res.json({ message: 'Price updated successfully', item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('buyer', 'name email phone')
      .populate('seller', 'name email phone')
      .populate('item', 'title images')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      transactions,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markDelivered = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    transaction.deliveryStatus = 'delivered';
    transaction.deliveredAt = new Date();
    await transaction.save();

    res.json({ message: 'Marked as delivered', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.releaseFundsToSeller = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('seller', 'name email bankDetails')
      .populate('item', 'title');

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.sellerPaid) return res.status(400).json({ message: 'Funds already released' });
    if (transaction.deliveryStatus !== 'delivered') {
      return res.status(400).json({ message: 'Item must be delivered before releasing funds' });
    }

    transaction.sellerPaid = true;
    transaction.sellerPaidAt = new Date();
    transaction.status = 'completed';
    transaction.completedAt = new Date();
    await transaction.save();

    await Item.findByIdAndUpdate(transaction.item._id, { status: 'sold', soldAt: new Date() });

    res.json({ message: 'Funds released to seller successfully', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalItems,
      pendingItems,
      approvedItems,
      soldItems,
      totalUsers,
      totalTransactions,
      completedTransactions,
      revenueResult,
    ] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ status: 'pending' }),
      Item.countDocuments({ status: 'approved' }),
      Item.countDocuments({ status: 'sold' }),
      User.countDocuments({ role: { $ne: 'admin' } }),
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: 'completed' }),
      Transaction.aggregate([
        { $match: { paymentStatus: 'success' } },
        { $group: { _id: null, total: { $sum: '$platformFee' } } },
      ]),
    ]);

    res.json({
      items: { total: totalItems, pending: pendingItems, approved: approvedItems, sold: soldItems },
      users: { total: totalUsers },
      transactions: { total: totalTransactions, completed: completedTransactions },
      revenue: revenueResult[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
