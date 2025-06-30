const mongoose = require('mongoose');

const merchandiseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  publisherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Publisher is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['clothing', 'accessories', 'stationery', 'collectibles', 'other']
  },
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  weight: {
    type: Number
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  }
}, {
  timestamps: true
});

merchandiseSchema.index({ publisherId: 1 });
merchandiseSchema.index({ category: 1 });
merchandiseSchema.index({ isActive: 1 });
merchandiseSchema.index({ price: 1 });

module.exports = mongoose.model('Merchandise', merchandiseSchema); 