const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { BadRequestError, NotFoundError } = require('../utils/errors');

const Review = require('../models/Review');
const Book = require('../models/Book');

const router = express.Router();

// @desc    Get reviews for a book
// @route   GET /api/reviews/book/:bookId
// @access  Public
router.get('/book/:bookId', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Check if book exists
  const book = await Book.findById(req.params.bookId);
  if (!book) {
    throw new NotFoundError('Book not found');
  }

  const reviews = await Review.find({ bookId: req.params.bookId })
    .populate('buyerId', 'name')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Review.countDocuments({ bookId: req.params.bookId });

  res.json({
    success: true,
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @desc    Get review statistics for a book
// @route   GET /api/reviews/book/:bookId/stats
// @access  Public
router.get('/book/:bookId/stats', asyncHandler(async (req, res) => {
  // Check if book exists
  const book = await Book.findById(req.params.bookId);
  if (!book) {
    throw new NotFoundError('Book not found');
  }

  const stats = await Review.aggregate([
    { $match: { bookId: book._id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return res.json({
      success: true,
      data: {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        }
      }
    });
  }

  const ratingDistribution = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  };

  stats[0].ratingDistribution.forEach(rating => {
    ratingDistribution[rating]++;
  });

  res.json({
    success: true,
    data: {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
      ratingDistribution
    }
  });
}));

module.exports = router; 