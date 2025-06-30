const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  inviterSellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Inviter seller is required']
  },
  inviteeSellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Invitee seller is required']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  referralCode: {
    type: String,
    unique: true
  },
  commissionEarned: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

referralSchema.index({ inviterSellerId: 1 });
referralSchema.index({ inviteeSellerId: 1 });
referralSchema.index({ status: 1 });
referralSchema.index({ referralCode: 1 });

module.exports = mongoose.model('Referral', referralSchema); 