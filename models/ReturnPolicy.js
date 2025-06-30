const mongoose = require('mongoose');

const returnPolicySchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Seller is required'],
    unique: true
  },
  refundWindow: {
    type: Number,
    required: [true, 'Refund window is required'],
    min: [0, 'Refund window cannot be negative']
  },
  shippingPolicy: {
    type: String,
    required: [true, 'Shipping policy is required']
  },
  returnConditions: {
    type: String
  },
  restockingFee: {
    type: Number,
    min: [0, 'Restocking fee cannot be negative'],
    max: [100, 'Restocking fee cannot exceed 100%'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

returnPolicySchema.index({ sellerId: 1 });
returnPolicySchema.index({ isActive: 1 });

module.exports = mongoose.model('ReturnPolicy', returnPolicySchema); 