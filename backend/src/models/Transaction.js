const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },

    itemPrice: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    paymentReference: { type: String, required: true, unique: true },
    paystackReference: { type: String },

    status: {
      type: String,
      enum: ['pending', 'paid', 'delivered', 'completed', 'refunded', 'failed'],
      default: 'pending',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },

    deliveryStatus: {
      type: String,
      enum: ['pending', 'in_transit', 'delivered', 'confirmed'],
      default: 'pending',
    },

    sellerPaid: { type: Boolean, default: false },
    sellerPaidAt: { type: Date },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
    completedAt: { type: Date },

    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
