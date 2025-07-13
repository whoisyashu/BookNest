const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');

const Seller = require('../models/Seller');
const Book = require('../models/Book');
const OnboardingStatus = require('../models/OnboardingStatus');
const Document = require('../models/Document');
const PaymentAccount = require('../models/PaymentAccount');
const ReturnPolicy = require('../models/ReturnPolicy');
const SellerReward = require('../models/SellerReward');
const SellerBadge = require('../models/SellerBadge');
const Order = require('../models/Order');
const ReturnRequest = require('../models/ReturnRequest');

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('seller'));

// @desc    Get seller profile
// @route   GET /api/seller/profile
// @access  Private
router.get('/profile', asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.user.sellerId)
    .populate('tierId')
    .select('-password');

  if (!seller) {
    throw new NotFoundError('Seller not found');
  }

  res.json({
    success: true,
    data: seller
  });
}));

// @desc    Update seller profile
// @route   PUT /api/seller/profile
// @access  Private
router.put('/profile', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const { name, phone, bio, profileImage } = req.body;

  const seller = await Seller.findByIdAndUpdate(
    req.user.sellerId,
    { name, phone, bio, profileImage },
    { new: true, runValidators: true }
  ).populate('tierId');

  res.json({
    success: true,
    data: seller
  });
}));

// @desc    Get seller books
// @route   GET /api/seller/books
// @access  Private
router.get('/books', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const books = await Book.find({ sellerId: req.user.sellerId })
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Book.countDocuments({ sellerId: req.user.sellerId });

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

// @desc    Create new book
// @route   POST /api/seller/books
// @access  Private
router.post('/books', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('ISBN').trim().notEmpty().withMessage('ISBN is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('description').optional().trim(),
  body('genre').optional().trim(),
  body('language').optional().trim(),
  body('condition').optional().isIn(['new', 'like_new', 'good', 'fair', 'poor']),
  body('format').optional().isIn(['hardcover', 'paperback', 'ebook', 'audiobook'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  // Check if ISBN already exists
  const existingBook = await Book.findOne({ ISBN: req.body.ISBN });
  if (existingBook) {
    throw new BadRequestError('Book with this ISBN already exists');
  }

  const book = await Book.create({
    ...req.body,
    sellerId: req.user.sellerId
  });

  res.status(201).json({
    success: true,
    data: book
  });
}));

// @desc    Update book
// @route   PUT /api/seller/books/:id
// @access  Private
router.put('/books/:id', [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('author').optional().trim().notEmpty().withMessage('Author cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new NotFoundError('Book not found');
  }

  if (book.sellerId.toString() !== req.user.sellerId) {
    throw new ForbiddenError('Not authorized to update this book');
  }

  const updatedBook = await Book.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: updatedBook
  });
}));

// @desc    Delete book
// @route   DELETE /api/seller/books/:id
// @access  Private
router.delete('/books/:id', asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new NotFoundError('Book not found');
  }

  if (book.sellerId.toString() !== req.user.sellerId) {
    throw new ForbiddenError('Not authorized to delete this book');
  }

  await Book.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Book deleted successfully'
  });
}));

// @desc    Get seller orders
// @route   GET /api/seller/orders
// @access  Private
router.get('/orders', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const orders = await Order.find({ 
    bookId: { $in: await Book.find({ sellerId: req.user.sellerId }).select('_id') }
  })
    .populate('buyerId', 'name email')
    .populate('bookId', 'title author price')
    .sort({ orderDate: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Order.countDocuments({ 
    bookId: { $in: await Book.find({ sellerId: req.user.sellerId }).select('_id') }
  });

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

// @desc    Update order status
// @route   PUT /api/seller/orders/:id/status
// @access  Private
router.put('/orders/:id/status', [
  body('deliveryStatus').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid delivery status'),
  body('trackingNumber').optional().trim()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const order = await Order.findById(req.params.id)
    .populate('bookId');

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.bookId.sellerId.toString() !== req.user.sellerId) {
    throw new ForbiddenError('Not authorized to update this order');
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    {
      deliveryStatus: req.body.deliveryStatus,
      trackingNumber: req.body.trackingNumber
    },
    { new: true }
  ).populate('buyerId', 'name email')
   .populate('bookId', 'title author price');

  res.json({
    success: true,
    data: updatedOrder
  });
}));

// @desc    Get return requests
// @route   GET /api/seller/returns
// @access  Private
router.get('/returns', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const returnRequests = await ReturnRequest.find({
    bookId: { $in: await Book.find({ sellerId: req.user.sellerId }).select('_id') }
  })
    .populate('buyerId', 'name email')
    .populate('bookId', 'title author price')
    .populate('orderId', 'orderDate totalAmount')
    .sort({ requestDate: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await ReturnRequest.countDocuments({
    bookId: { $in: await Book.find({ sellerId: req.user.sellerId }).select('_id') }
  });

  res.json({
    success: true,
    data: returnRequests,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @desc    Update return request status
// @route   PUT /api/seller/returns/:id/status
// @access  Private
router.put('/returns/:id/status', [
  body('status').isIn(['open', 'approved', 'denied', 'processing', 'completed'])
    .withMessage('Invalid status'),
  body('refundAmount').optional().isFloat({ min: 0 }).withMessage('Refund amount must be positive'),
  body('notes').optional().trim()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const returnRequest = await ReturnRequest.findById(req.params.id)
    .populate('bookId');

  if (!returnRequest) {
    throw new NotFoundError('Return request not found');
  }

  if (returnRequest.bookId.sellerId.toString() !== req.user.sellerId) {
    throw new ForbiddenError('Not authorized to update this return request');
  }

  const updatedReturn = await ReturnRequest.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      refundAmount: req.body.refundAmount,
      notes: req.body.notes,
      processedDate: req.body.status !== 'open' ? new Date() : undefined,
      processedBy: req.user.sellerId
    },
    { new: true }
  ).populate('buyerId', 'name email')
   .populate('bookId', 'title author price')
   .populate('orderId', 'orderDate totalAmount');

  res.json({
    success: true,
    data: updatedReturn
  });
}));

// @desc    Get seller dashboard stats
// @route   GET /api/seller/dashboard
// @access  Private
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [
    totalBooks,
    totalOrders,
    totalSales,
    pendingReturns,
    recentOrders,
    topBooks
  ] = await Promise.all([
    Book.countDocuments({ sellerId: req.user.sellerId }),
    Order.countDocuments({ 
      bookId: { $in: await Book.find({ sellerId: req.user.sellerId }).select('_id') }
    }),
    Order.aggregate([
      {
        $match: {
          bookId: { $in: await Book.find({ sellerId: req.user.sellerId }).select('_id') },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]),
    ReturnRequest.countDocuments({
      bookId: { $in: await Book.find({ sellerId: req.user.sellerId }).select('_id') },
      status: 'open'
    }),
    Order.find({ 
      bookId: { $in: await Book.find({ sellerId: req.user.sellerId }).select('_id') }
    })
      .populate('buyerId', 'name')
      .populate('bookId', 'title')
      .sort({ orderDate: -1 })
      .limit(5),
    Book.find({ sellerId: req.user.sellerId })
      .sort({ 'rating.average': -1 })
      .limit(5)
  ]);

  res.json({
    success: true,
    data: {
      totalBooks,
      totalOrders,
      totalSales: totalSales[0]?.total || 0,
      pendingReturns,
      recentOrders,
      topBooks
    }
  });
}));

// @desc    Get seller stats (alias for dashboard)
// @route   GET /api/seller/stats
// @access  Private
router.get('/stats', asyncHandler(async (req, res) => {
  const [
    totalBooks,
    totalOrders,
    totalSales
  ] = await Promise.all([
    Book.countDocuments({ sellerId: req.user.sellerId }),
    Order.countDocuments({ 
      bookId: { $in: await Book.find({ sellerId: req.user.sellerId }).select('_id') }
    }),
    Order.aggregate([
      {
        $match: {
          bookId: { $in: await Book.find({ sellerId: req.user.sellerId }).select('_id') },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ])
  ]);

  res.json({
    success: true,
    data: {
      totalBooks,
      totalOrders,
      totalRevenue: totalSales[0]?.total || 0,
      averageRating: 0 // This would be calculated from reviews
    }
  });
}));

module.exports = router; 
 