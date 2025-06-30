const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book is required']
  },
  type: {
    type: String,
    required: [true, 'Promotion type is required'],
    enum: ['discount', 'bogo', 'free_shipping', 'cashback', 'flash_sale']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  discountPercentage: {
    type: Number,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100%']
  },
  discountAmount: {
    type: Number,
    min: [0, 'Discount amount cannot be negative']
  },
  minimumQuantity: {
    type: Number,
    min: [1, 'Minimum quantity must be at least 1'],
    default: 1
  },
  maxUses: {
    type: Number,
    min: [1, 'Maximum uses must be at least 1']
  },
  currentUses: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

promotionSchema.index({ bookId: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ type: 1 });

module.exports = mongoose.model('Promotion', promotionSchema); 