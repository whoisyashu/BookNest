const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: [true, 'Buyer is required'],
    unique: true
  },
  bookIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  name: {
    type: String,
    default: 'My Wishlist'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

wishlistSchema.index({ buyerId: 1 });
wishlistSchema.index({ bookIds: 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema); 