const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    count: { type: Number, default: 0 },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Buyer' }]
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

// Compound index to ensure one review per buyer per book
reviewSchema.index({ bookId: 1, buyerId: 1 }, { unique: true });

// Indexes for faster queries
reviewSchema.index({ bookId: 1 });
reviewSchema.index({ buyerId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

// Update book rating when review is saved/updated
reviewSchema.post('save', async function() {
  await updateBookRating(this.bookId);
});

reviewSchema.post('findOneAndUpdate', async function() {
  if (this.bookId) {
    await updateBookRating(this.bookId);
  }
});

reviewSchema.post('findOneAndDelete', async function() {
  if (this.bookId) {
    await updateBookRating(this.bookId);
  }
});

// Function to update book rating
async function updateBookRating(bookId) {
  const Review = mongoose.model('Review');
  const Book = mongoose.model('Book');
  
  const stats = await Review.aggregate([
    { $match: { bookId: bookId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      'rating.average': Math.round(stats[0].averageRating * 10) / 10,
      'rating.count': stats[0].count
    });
  }
}

module.exports = mongoose.model('Review', reviewSchema); 