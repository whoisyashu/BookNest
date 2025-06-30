const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');

const Buyer = require('../models/Buyer');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Wishlist = require('../models/Wishlist');
const Book = require('../models/Book');
const Review = require('../models/Review');
const ReturnRequest = require('../models/ReturnRequest');

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('buyer'));

// @desc    Get buyer profile
// @route   GET /api/buyer/profile
// @access  Private
router.get('/profile', asyncHandler(async (req, res) => {
  const buyer = await Buyer.findById(req.user.buyerId)
    .select('-password');

  if (!buyer) {
    throw new NotFoundError('Buyer not found');
  }

  res.json({
    success: true,
    data: buyer
  });
}));

// @desc    Update buyer profile
// @route   PUT /api/buyer/profile
// @access  Private
router.put('/profile', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const { name, phone, address, preferences } = req.body;

  const buyer = await Buyer.findByIdAndUpdate(
    req.user.buyerId,
    { name, phone, address, preferences },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: buyer
  });
}));

// @desc    Get buyer orders
// @route   GET /api/buyer/orders
// @access  Private
router.get('/orders', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const orders = await Order.find({ buyerId: req.user.buyerId })
    .populate('bookId', 'title author price images sellerId')
    .populate('bookId.sellerId', 'name')
    .sort({ orderDate: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Order.countDocuments({ buyerId: req.user.buyerId });

  res.json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @desc    Get buyer cart
// @route   GET /api/buyer/cart
// @access  Private
router.get('/cart', asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ buyerId: req.user.buyerId });

  if (!cart) {
    cart = await Cart.create({ buyerId: req.user.buyerId });
  }

  const cartItems = await CartItem.find({ cartId: cart._id })
    .populate('bookId', 'title author price images quantity isActive');

  const total = cartItems.reduce((sum, item) => {
    return sum + (item.priceAtAddition * item.quantity);
  }, 0);

  res.json({
    success: true,
    data: {
      cart,
      items: cartItems,
      total
    }
  });
}));

// @desc    Add item to cart
// @route   POST /api/buyer/cart/items
// @access  Private
router.post('/cart/items', [
  body('bookId').isMongoId().withMessage('Valid book ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const { bookId, quantity } = req.body;

  // Check if book exists and is active
  const book = await Book.findById(bookId);
  if (!book) {
    throw new NotFoundError('Book not found');
  }

  if (!book.isActive) {
    throw new BadRequestError('Book is not available');
  }

  if (book.quantity < quantity) {
    throw new BadRequestError('Insufficient stock');
  }

  // Get or create cart
  let cart = await Cart.findOne({ buyerId: req.user.buyerId });
  if (!cart) {
    cart = await Cart.create({ buyerId: req.user.buyerId });
  }

  // Check if item already in cart
  let cartItem = await CartItem.findOne({
    cartId: cart._id,
    bookId: bookId
  });

  if (cartItem) {
    // Update quantity
    cartItem.quantity += quantity;
    await cartItem.save();
  } else {
    // Create new cart item
    cartItem = await CartItem.create({
      cartId: cart._id,
      bookId: bookId,
      quantity: quantity,
      priceAtAddition: book.price
    });
  }

  await cartItem.populate('bookId', 'title author price images');

  res.status(201).json({
    success: true,
    data: cartItem
  });
}));

// @desc    Get buyer wishlist
// @route   GET /api/buyer/wishlist
// @access  Private
router.get('/wishlist', asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ buyerId: req.user.buyerId });

  if (!wishlist) {
    wishlist = await Wishlist.create({ buyerId: req.user.buyerId });
  }

  const books = await Book.find({ _id: { $in: wishlist.bookIds } })
    .populate('sellerId', 'name');

  res.json({
    success: true,
    data: {
      wishlist,
      books
    }
  });
}));

// @desc    Add book to wishlist
// @route   POST /api/buyer/wishlist/books
// @access  Private
router.post('/wishlist/books', [
  body('bookId').isMongoId().withMessage('Valid book ID is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const { bookId } = req.body;

  // Check if book exists
  const book = await Book.findById(bookId);
  if (!book) {
    throw new NotFoundError('Book not found');
  }

  let wishlist = await Wishlist.findOne({ buyerId: req.user.buyerId });

  if (!wishlist) {
    wishlist = await Wishlist.create({ buyerId: req.user.buyerId });
  }

  // Check if book already in wishlist
  if (wishlist.bookIds.includes(bookId)) {
    throw new BadRequestError('Book already in wishlist');
  }

  wishlist.bookIds.push(bookId);
  await wishlist.save();

  res.status(201).json({
    success: true,
    data: wishlist
  });
}));

// @desc    Create review
// @route   POST /api/buyer/reviews
// @access  Private
router.post('/reviews', [
  body('bookId').isMongoId().withMessage('Valid book ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const { bookId, rating, comment } = req.body;

  // Check if book exists
  const book = await Book.findById(bookId);
  if (!book) {
    throw new NotFoundError('Book not found');
  }

  // Check if buyer has purchased this book
  const order = await Order.findOne({
    buyerId: req.user.buyerId,
    bookId: bookId,
    deliveryStatus: 'delivered'
  });

  if (!order) {
    throw new BadRequestError('You can only review books you have purchased and received');
  }

  // Check if review already exists
  const existingReview = await Review.findOne({
    buyerId: req.user.buyerId,
    bookId: bookId
  });

  if (existingReview) {
    throw new BadRequestError('You have already reviewed this book');
  }

  const review = await Review.create({
    bookId,
    buyerId: req.user.buyerId,
    rating,
    comment
  });

  await review.populate('buyerId', 'name');

  res.status(201).json({
    success: true,
    data: review
  });
}));

module.exports = router; 