const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  ISBN: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Seller is required']
  },
  description: {
    type: String,
    trim: true
  },
  genre: {
    type: String,
    trim: true
  },
  language: {
    type: String,
    default: 'English'
  },
  condition: {
    type: String,
    enum: ['new', 'like_new', 'good', 'fair', 'poor'],
    default: 'good'
  },
  format: {
    type: String,
    enum: ['hardcover', 'paperback', 'ebook', 'audiobook'],
    default: 'paperback'
  },
  publicationYear: {
    type: Number
  },
  publisher: {
    type: String,
    trim: true
  },
  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1']
  },
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes for faster queries
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ sellerId: 1 });
bookSchema.index({ ISBN: 1 });
bookSchema.index({ genre: 1 });
bookSchema.index({ isActive: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ 'rating.average': -1 });

// Virtual for checking if book is in stock
bookSchema.virtual('inStock').get(function() {
  return this.quantity > 0;
});

// Ensure virtual fields are serialized
bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema); 