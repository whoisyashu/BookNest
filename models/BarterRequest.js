const mongoose = require('mongoose');

const barterRequestSchema = new mongoose.Schema({
  initiatorId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'initiatorModel',
    required: [true, 'Initiator is required']
  },
  initiatorModel: {
    type: String,
    enum: ['Seller', 'Buyer'],
    required: [true, 'Initiator model is required']
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetUserModel',
    required: [true, 'Target user is required']
  },
  targetUserModel: {
    type: String,
    enum: ['Seller', 'Buyer'],
    required: [true, 'Target user model is required']
  },
  offeredItemId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'offeredItemModel',
    required: [true, 'Offered item is required']
  },
  offeredItemModel: {
    type: String,
    enum: ['Book', 'Merchandise', 'PremiumContent'],
    required: [true, 'Offered item model is required']
  },
  requestedItemId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'requestedItemModel',
    required: [true, 'Requested item is required']
  },
  requestedItemModel: {
    type: String,
    enum: ['Book', 'Merchandise', 'PremiumContent'],
    required: [true, 'Requested item model is required']
  },
  status: {
    type: String,
    enum: ['open', 'accepted', 'rejected', 'cancelled'],
    default: 'open'
  },
  message: {
    type: String
  },
  counterOffer: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

barterRequestSchema.index({ initiatorId: 1 });
barterRequestSchema.index({ targetUserId: 1 });
barterRequestSchema.index({ status: 1 });
barterRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('BarterRequest', barterRequestSchema); 