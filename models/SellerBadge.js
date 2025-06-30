const mongoose = require('mongoose');

const sellerBadgeSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Seller is required']
  },
  badgeName: {
    type: String,
    required: [true, 'Badge name is required']
  },
  awardedAt: {
    type: Date,
    default: Date.now
  },
  badgeType: {
    type: String,
    enum: [
      'sales_milestone',
      'rating_achievement',
      'shipping_excellence',
      'customer_service',
      'early_adopter',
      'top_seller',
      'quality_guarantee'
    ]
  },
  description: {
    type: String
  },
  icon: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

sellerBadgeSchema.index({ sellerId: 1 });
sellerBadgeSchema.index({ badgeName: 1 });
sellerBadgeSchema.index({ awardedAt: -1 });

module.exports = mongoose.model('SellerBadge', sellerBadgeSchema); 