const mongoose = require('mongoose');

const sellerRewardSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Seller is required']
  },
  points: {
    type: Number,
    required: [true, 'Points are required']
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: [
      'first_sale',
      'milestone_sales',
      'positive_review',
      'fast_shipping',
      'perfect_rating',
      'referral',
      'bonus',
      'penalty'
    ]
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

sellerRewardSchema.index({ sellerId: 1 });
sellerRewardSchema.index({ eventType: 1 });
sellerRewardSchema.index({ timestamp: -1 });

module.exports = mongoose.model('SellerReward', sellerRewardSchema); 