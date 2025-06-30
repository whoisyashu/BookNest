const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: [true, 'Buyer is required']
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  priceAtPurchase: {
    type: Number,
    required: [true, 'Purchase price is required'],
    min: [0, 'Price cannot be negative']
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  trackingNumber: {
    type: String
  },
  estimatedDelivery: {
    type: Date
  },
  notes: {
    type: String
  },
  totalAmount: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  shippingAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for faster queries
orderSchema.index({ buyerId: 1 });
orderSchema.index({ bookId: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ deliveryStatus: 1 });

// Virtual for order status
orderSchema.virtual('orderStatus').get(function() {
  if (this.deliveryStatus === 'cancelled') return 'cancelled';
  if (this.paymentStatus === 'failed') return 'payment_failed';
  if (this.paymentStatus === 'pending') return 'awaiting_payment';
  return this.deliveryStatus;
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema); 