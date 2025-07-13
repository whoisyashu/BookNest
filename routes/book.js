const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { optionalAuth, protect, authorize } = require('../middleware/auth');
const { BadRequestError, NotFoundError } = require('../utils/errors');

const Book = require('../models/Book');
const Review = require('../models/Review');

const router = express.Router();

// @desc    Get all books (public)
// @route   GET /api/books
// @access  Public
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Build query
  const query = { isActive: true };

  // Search functionality
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Filter by genre
  if (req.query.genre) {
    query.genre = req.query.genre;
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Filter by condition
  if (req.query.condition) {
    query.condition = req.query.condition;
  }

  // Filter by format
  if (req.query.format) {
    query.format = req.query.format;
  }

  // Sort options
  let sort = {};
  if (req.query.sort) {
    switch (req.query.sort) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }
  } else {
    sort = { createdAt: -1 };
  }

  const books = await Book.find(query)
    .populate('sellerId', 'name')
    .sort(sort)
    .skip(startIndex)
    .limit(limit);

  const total = await Book.countDocuments(query);

  res.json({
    success: true,
    data: books,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @desc    Get book by ID
// @route   GET /api/books/:id
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id)
    .populate('sellerId', 'name email bio');

  if (!book) {
    throw new NotFoundError('Book not found');
  }

  if (!book.isActive) {
    throw new NotFoundError('Book is not available');
  }

  // Get reviews for this book
  const reviews = await Review.find({ bookId: req.params.id })
    .populate('buyerId', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    success: true,
    data: {
      book,
      reviews
    }
  });
}));

// @desc    Get book reviews
// @route   GET /api/books/:id/reviews
// @access  Public
router.get('/:id/reviews', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const reviews = await Review.find({ bookId: req.params.id })
    .populate('buyerId', 'name')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Review.countDocuments({ bookId: req.params.id });

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

// @desc    Search books
// @route   GET /api/books/search
// @access  Public
router.get('/search', asyncHandler(async (req, res) => {
  const { q, genre, minPrice, maxPrice, condition, format, sort } = req.query;

  if (!q) {
    throw new BadRequestError('Search query is required');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  // Build search query
  const query = {
    isActive: true,
    $text: { $search: q }
  };

  // Add filters
  if (genre) query.genre = genre;
  if (condition) query.condition = condition;
  if (format) query.format = format;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // Sort options
  let sortOption = {};
  if (sort) {
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { 'rating.average': -1 };
        break;
      case 'relevance':
        sortOption = { score: { $meta: 'textScore' } };
        break;
      default:
        sortOption = { score: { $meta: 'textScore' } };
    }
  } else {
    sortOption = { score: { $meta: 'textScore' } };
  }

  const books = await Book.find(query)
    .populate('sellerId', 'name')
    .sort(sortOption)
    .skip(startIndex)
    .limit(limit);

  const total = await Book.countDocuments(query);

  res.json({
    success: true,
    data: books,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @desc    Get books by seller
// @route   GET /api/books/seller/:sellerId
// @access  Public
router.get('/seller/:sellerId', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const books = await Book.find({ 
    sellerId: req.params.sellerId,
    isActive: true 
  })
    .populate('sellerId', 'name')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Book.countDocuments({ 
    sellerId: req.params.sellerId,
    isActive: true 
  });

  res.json({
    success: true,
    data: books,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @desc    Get current seller's books
// @route   GET /api/books/seller
// @access  Private (Seller only)
router.get('/seller', protect, authorize('seller'), asyncHandler(async (req, res) => {

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const books = await Book.find({ 
    sellerId: req.user.id
  })
    .populate('sellerId', 'name')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Book.countDocuments({ 
    sellerId: req.user.id
  });

  res.json({
    success: true,
    data: books,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @desc    Create a new book
// @route   POST /api/books
// @access  Private (Seller only)
router.post('/', protect, authorize('seller'), asyncHandler(async (req, res) => {
  const {
    title,
    author,
    ISBN,
    price,
    quantity,
    description,
    genre,
    language,
    condition,
    format,
    publicationYear,
    publisher,
    pages,
    tags
  } = req.body;

  // Check if ISBN already exists
  const existingBook = await Book.findOne({ ISBN });
  if (existingBook) {
    throw new BadRequestError('A book with this ISBN already exists');
  }

  // Create book
  const book = await Book.create({
    title,
    author,
    ISBN,
    price,
    quantity,
    description,
    genre,
    language,
    condition,
    format,
    publicationYear,
    publisher,
    pages,
    tags,
    sellerId: req.user.id
  });

  res.status(201).json({
    success: true,
    data: book
  });
}));

// @desc    Get popular books
// @route   GET /api/books/popular
// @access  Public
router.get('/popular', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  const books = await Book.find({ isActive: true })
    .populate('sellerId', 'name')
    .sort({ 'rating.average': -1, 'rating.count': -1 })
    .limit(limit);

  res.json({
    success: true,
    data: books
  });
}));

// @desc    Get new arrivals
// @route   GET /api/books/new-arrivals
// @access  Public
router.get('/new-arrivals', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  const books = await Book.find({ isActive: true })
    .populate('sellerId', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({
    success: true,
    data: books
  });
}));

module.exports = router; 