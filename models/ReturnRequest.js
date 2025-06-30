const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book is required']
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: [true, 'Buyer is required']
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order is required']
  },
  reason: {
    type: String,
    required: [true, 'Return reason is required']
  },
  status: {
    type: String,
    enum: ['open', 'approved', 'denied', 'processing', 'completed'],
    default: 'open'
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative']
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  processedDate: {
    type: Date
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
  },
  returnShippingLabel: {
    type: String
  },
  trackingNumber: {
    type: String
  },
  notes: {
    type: String
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

returnRequestSchema.index({ bookId: 1 });
returnRequestSchema.index({ buyerId: 1 });
returnRequestSchema.index({ orderId: 1 });
returnRequestSchema.index({ status: 1 });
returnRequestSchema.index({ requestDate: -1 });

module.exports = mongoose.model('ReturnRequest', returnRequestSchema); 