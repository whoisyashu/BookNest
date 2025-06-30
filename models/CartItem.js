const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    required: [true, 'Cart is required']
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
  addedAt: {
    type: Date,
    default: Date.now
  },
  priceAtAddition: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique book per cart
cartItemSchema.index({ cartId: 1, bookId: 1 }, { unique: true });

// Indexes for faster queries
cartItemSchema.index({ cartId: 1 });
cartItemSchema.index({ bookId: 1 });

module.exports = mongoose.model('CartItem', cartItemSchema); 