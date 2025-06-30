const mongoose = require('mongoose');

const paymentAccountSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Seller is required']
  },
  method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['bank', 'upi', 'paypal', 'stripe']
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Payment details are required']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure only one default payment method per seller
paymentAccountSchema.index({ sellerId: 1, isDefault: 1 }, { 
  unique: true, 
  partialFilterExpression: { isDefault: true } 
});

// Indexes for faster queries
paymentAccountSchema.index({ sellerId: 1 });
paymentAccountSchema.index({ method: 1 });
paymentAccountSchema.index({ isActive: 1 });

// Pre-save middleware to ensure only one default payment method
paymentAccountSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { sellerId: this.sellerId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

module.exports = mongoose.model('PaymentAccount', paymentAccountSchema); 