const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: [true, 'Buyer is required'],
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
cartSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for faster queries
cartSchema.index({ buyerId: 1 });
cartSchema.index({ isActive: 1 });

module.exports = mongoose.model('Cart', cartSchema); 