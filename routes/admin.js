const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');

const Seller = require('../models/Seller');
const Buyer = require('../models/Buyer');
const Book = require('../models/Book');
const Order = require('../models/Order');
const Document = require('../models/Document');
const SellerTier = require('../models/SellerTier');
const ReturnRequest = require('../models/ReturnRequest');

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('admin'));

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [
    totalSellers,
    totalBuyers,
    totalBooks,
    totalOrders,
    totalSales,
    pendingDocuments,
    pendingReturns
  ] = await Promise.all([
    Seller.countDocuments(),
    Buyer.countDocuments(),
    Book.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Document.countDocuments({ verified: false }),
    ReturnRequest.countDocuments({ status: 'open' })
  ]);

  res.json({
    success: true,
    data: {
      totalSellers,
      totalBuyers,
      totalBooks,
      totalOrders,
      totalSales: totalSales[0]?.total || 0,
      pendingDocuments,
      pendingReturns
    }
  });
}));

// @desc    Get all sellers
// @route   GET /api/admin/sellers
// @access  Private
router.get('/sellers', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const sellers = await Seller.find()
    .populate('tierId')
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Seller.countDocuments();

  res.json({
    success: true,
    data: sellers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @desc    Get seller by ID
// @route   GET /api/admin/sellers/:id
// @access  Private
router.get('/sellers/:id', asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.params.id)
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

// @desc    Update seller verification status
// @route   PUT /api/admin/sellers/:id/verify
// @access  Private
router.put('/sellers/:id/verify', [
  body('isVerified').isBoolean().withMessage('Verification status must be boolean')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const seller = await Seller.findByIdAndUpdate(
    req.params.id,
    { isVerified: req.body.isVerified },
    { new: true }
  ).populate('tierId')
   .select('-password');

  if (!seller) {
    throw new NotFoundError('Seller not found');
  }

  res.json({
    success: true,
    data: seller
  });
}));

// @desc    Get all buyers
// @route   GET /api/admin/buyers
// @access  Private
router.get('/buyers', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const buyers = await Buyer.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Buyer.countDocuments();

  res.json({
    success: true,
    data: buyers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @desc    Get all books
// @route   GET /api/admin/books
// @access  Private
router.get('/books', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const books = await Book.find()
    .populate('sellerId', 'name')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Book.countDocuments();

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

// @desc    Update book status
// @route   PUT /api/admin/books/:id/status
// @access  Private
router.put('/books/:id/status', [
  body('isActive').isBoolean().withMessage('Active status must be boolean')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const book = await Book.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true }
  ).populate('sellerId', 'name');

  if (!book) {
    throw new NotFoundError('Book not found');
  }

  res.json({
    success: true,
    data: book
  });
}));

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private
router.get('/orders', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const orders = await Order.find()
    .populate('buyerId', 'name email')
    .populate('bookId', 'title author price sellerId')
    .populate('bookId.sellerId', 'name')
    .sort({ orderDate: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Order.countDocuments();

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

// @desc    Get pending documents
// @route   GET /api/admin/documents/pending
// @access  Private
router.get('/documents/pending', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const documents = await Document.find({ verified: false })
    .populate('sellerId', 'name email')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Document.countDocuments({ verified: false });

  res.json({
    success: true,
    data: documents,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// @desc    Verify document
// @route   PUT /api/admin/documents/:id/verify
// @access  Private
router.put('/documents/:id/verify', [
  body('verified').isBoolean().withMessage('Verification status must be boolean'),
  body('rejectionReason').optional().trim()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const { verified, rejectionReason } = req.body;

  const document = await Document.findByIdAndUpdate(
    req.params.id,
    {
      verified,
      verifiedBy: req.user.id,
      verifiedAt: new Date(),
      rejectionReason: !verified ? rejectionReason : undefined
    },
    { new: true }
  ).populate('sellerId', 'name email');

  if (!document) {
    throw new NotFoundError('Document not found');
  }

  res.json({
    success: true,
    data: document
  });
}));

// @desc    Get seller tiers
// @route   GET /api/admin/tiers
// @access  Private
router.get('/tiers', asyncHandler(async (req, res) => {
  const tiers = await SellerTier.find().sort({ maxListings: 1 });

  res.json({
    success: true,
    data: tiers
  });
}));

// @desc    Create seller tier
// @route   POST /api/admin/tiers
// @access  Private
router.post('/tiers', [
  body('name').trim().notEmpty().withMessage('Tier name is required'),
  body('maxListings').isInt({ min: 0 }).withMessage('Maximum listings must be non-negative'),
  body('commissionRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Commission rate must be between 0 and 100')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const tier = await SellerTier.create(req.body);

  res.status(201).json({
    success: true,
    data: tier
  });
}));

// @desc    Update seller tier
// @route   PUT /api/admin/tiers/:id
// @access  Private
router.put('/tiers/:id', [
  body('name').optional().trim().notEmpty().withMessage('Tier name cannot be empty'),
  body('maxListings').optional().isInt({ min: 0 }).withMessage('Maximum listings must be non-negative'),
  body('commissionRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Commission rate must be between 0 and 100')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const tier = await SellerTier.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!tier) {
    throw new NotFoundError('Tier not found');
  }

  res.json({
    success: true,
    data: tier
  });
}));

// @desc    Delete seller tier
// @route   DELETE /api/admin/tiers/:id
// @access  Private
router.delete('/tiers/:id', asyncHandler(async (req, res) => {
  const tier = await SellerTier.findById(req.params.id);

  if (!tier) {
    throw new NotFoundError('Tier not found');
  }

  // Check if any sellers are using this tier
  const sellersUsingTier = await Seller.countDocuments({ tierId: req.params.id });
  if (sellersUsingTier > 0) {
    throw new BadRequestError('Cannot delete tier that is being used by sellers');
  }

  await SellerTier.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Tier deleted successfully'
  });
}));

// @desc    Get return requests
// @route   GET /api/admin/returns
// @access  Private
router.get('/returns', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const returnRequests = await ReturnRequest.find()
    .populate('buyerId', 'name email')
    .populate('bookId', 'title author price sellerId')
    .populate('bookId.sellerId', 'name')
    .populate('orderId', 'orderDate totalAmount')
    .sort({ requestDate: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await ReturnRequest.countDocuments();

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

module.exports = router; 
 