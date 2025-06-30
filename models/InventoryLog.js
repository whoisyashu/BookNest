const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book is required']
  },
  changeType: {
    type: String,
    required: [true, 'Change type is required'],
    enum: ['purchase', 'sale', 'return', 'adjustment', 'damage', 'restock']
  },
  quantityChanged: {
    type: Number,
    required: [true, 'Quantity changed is required']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  reason: {
    type: String
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  previousQuantity: {
    type: Number,
    required: true
  },
  newQuantity: {
    type: Number,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'performedByModel'
  },
  performedByModel: {
    type: String,
    enum: ['Seller', 'Buyer', 'Admin']
  }
}, {
  timestamps: true
});

inventoryLogSchema.index({ bookId: 1 });
inventoryLogSchema.index({ timestamp: -1 });
inventoryLogSchema.index({ changeType: 1 });

module.exports = mongoose.model('InventoryLog', inventoryLogSchema); 