const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order is required']
  },
  method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'upi']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  transactionId: {
    type: String,
    unique: true
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String
  },
  currency: {
    type: String,
    default: 'USD'
  }
}, {
  timestamps: true
});

paymentSchema.index({ orderId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Payment', paymentSchema); 