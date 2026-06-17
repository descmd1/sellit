const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Electronics', 'Furniture', 'Clothing', 'Vehicles', 'Real Estate', 'Sports', 'Books', 'Art', 'Other'],
    },
    condition: { type: String, required: true, enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'] },
    images: [{ url: String, publicId: String }],
    videos: [{ url: String, publicId: String }],
    location: { type: String, required: true },
    expectedPrice: { type: Number },
    finalPrice: { type: Number },
    platformFee: { type: Number },
    totalAmount: { type: Number },

    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'sold'],
      default: 'pending',
    },

    adminNotes: { type: String },
    rejectionReason: { type: String },
    verifiedAt: { type: Date },
    soldAt: { type: Date },

    isPublished: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

itemSchema.index({ status: 1, isPublished: 1 });
itemSchema.index({ seller: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Item', itemSchema);
