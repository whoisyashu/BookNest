const mongoose = require('mongoose');

const sellerTierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tier name is required'],
    trim: true,
    unique: true
  },
  maxListings: {
    type: Number,
    required: [true, 'Maximum listings is required'],
    min: [0, 'Maximum listings cannot be negative']
  },
  commissionRate: {
    type: Number,
    min: [0, 'Commission rate cannot be negative'],
    max: [100, 'Commission rate cannot exceed 100%'],
    default: 0
  },
  perks: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
sellerTierSchema.index({ name: 1 });

module.exports = mongoose.model('SellerTier', sellerTierSchema); 