const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');

const Order = require('../models/Order');
const Book = require('../models/Book');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Payment = require('../models/Payment');
const InventoryLog = require('../models/InventoryLog');

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('buyer'));

// @desc    Create order from cart
// @route   POST /api/orders/checkout
// @access  Private
router.post('/checkout', [
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.street').notEmpty().withMessage('Street is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const { shippingAddress, paymentMethod, notes } = req.body;

  // Get buyer's cart
  const cart = await Cart.findOne({ buyerId: req.user.buyerId });
  if (!cart) {
    throw new BadRequestError('Cart is empty');
  }

  const cartItems = await CartItem.find({ cartId: cart._id })
    .populate('bookId');

  if (cartItems.length === 0) {
    throw new BadRequestError('Cart is empty');
  }

  // Validate stock and calculate totals
  let totalAmount = 0;
  const orders = [];

  for (const item of cartItems) {
    const book = item.bookId;
    
    if (!book.isActive) {
      throw new BadRequestError(`Book "${book.title}" is no longer available`);
    }

    if (book.quantity < item.quantity) {
      throw new BadRequestError(`Insufficient stock for "${book.title}"`);
    }

    const itemTotal = book.price * item.quantity;
    totalAmount += itemTotal;

    // Create order for this book
    const order = await Order.create({
      buyerId: req.user.buyerId,
      bookId: book._id,
      quantity: item.quantity,
      priceAtPurchase: book.price,
      totalAmount: itemTotal,
      shippingAddress,
      notes
    });

    // Update book quantity
    const previousQuantity = book.quantity;
    book.quantity -= item.quantity;
    await book.save();

    // Log inventory change
    await InventoryLog.create({
      bookId: book._id,
      changeType: 'sale',
      quantityChanged: -item.quantity,
      previousQuantity,
      newQuantity: book.quantity,
      orderId: order._id,
      performedBy: req.user.buyerId,
      performedByModel: 'Buyer'
    });

    orders.push(order);
  }

  // Create payment record
  const payment = await Payment.create({
    orderId: orders[0]._id, // We'll use the first order ID for now
    method: paymentMethod,
    amount: totalAmount,
    status: 'pending'
  });

  // Clear cart
  await CartItem.deleteMany({ cartId: cart._id });

  // Populate order details
  const populatedOrders = await Promise.all(
    orders.map(order => 
      Order.findById(order._id)
        .populate('bookId', 'title author price images sellerId')
        .populate('bookId.sellerId', 'name')
    )
  );

  res.status(201).json({
    success: true,
    data: {
      orders: populatedOrders,
      payment,
      totalAmount
    }
  });
}));

// @desc    Create single book order
// @route   POST /api/orders
// @access  Private
router.post('/', [
  body('bookId').isMongoId().withMessage('Valid book ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.street').notEmpty().withMessage('Street is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const { bookId, quantity, shippingAddress, paymentMethod, notes } = req.body;

  // Check if book exists and is available
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

  const totalAmount = book.price * quantity;

  // Create order
  const order = await Order.create({
    buyerId: req.user.buyerId,
    bookId,
    quantity,
    priceAtPurchase: book.price,
    totalAmount,
    shippingAddress,
    notes
  });

  // Update book quantity
  const previousQuantity = book.quantity;
  book.quantity -= quantity;
  await book.save();

  // Log inventory change
  await InventoryLog.create({
    bookId: book._id,
    changeType: 'sale',
    quantityChanged: -quantity,
    previousQuantity,
    newQuantity: book.quantity,
    orderId: order._id,
    performedBy: req.user.buyerId,
    performedByModel: 'Buyer'
  });

  // Create payment record
  const payment = await Payment.create({
    orderId: order._id,
    method: paymentMethod,
    amount: totalAmount,
    status: 'pending'
  });

  // Populate order details
  const populatedOrder = await Order.findById(order._id)
    .populate('bookId', 'title author price images sellerId')
    .populate('bookId.sellerId', 'name');

  res.status(201).json({
    success: true,
    data: {
      order: populatedOrder,
      payment,
      totalAmount
    }
  });
}));

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('bookId', 'title author price images sellerId')
    .populate('bookId.sellerId', 'name email');

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.buyerId.toString() !== req.user.buyerId) {
    throw new ForbiddenError('Not authorized to view this order');
  }

  // Get payment information
  const payment = await Payment.findOne({ orderId: order._id });

  res.json({
    success: true,
    data: {
      order,
      payment
    }
  });
}));

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('bookId');

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.buyerId.toString() !== req.user.buyerId) {
    throw new ForbiddenError('Not authorized to cancel this order');
  }

  if (order.deliveryStatus !== 'pending') {
    throw new BadRequestError('Order cannot be cancelled at this stage');
  }

  // Update order status
  order.deliveryStatus = 'cancelled';
  await order.save();

  // Restore book quantity
  const book = order.bookId;
  const previousQuantity = book.quantity;
  book.quantity += order.quantity;
  await book.save();

  // Log inventory change
  await InventoryLog.create({
    bookId: book._id,
    changeType: 'return',
    quantityChanged: order.quantity,
    previousQuantity,
    newQuantity: book.quantity,
    orderId: order._id,
    performedBy: req.user.buyerId,
    performedByModel: 'Buyer',
    reason: 'Order cancelled by buyer'
  });

  // Update payment status
  await Payment.findOneAndUpdate(
    { orderId: order._id },
    { status: 'refunded' }
  );

  res.json({
    success: true,
    data: order,
    message: 'Order cancelled successfully'
  });
}));

// @desc    Get order tracking
// @route   GET /api/orders/:id/tracking
// @access  Private
router.get('/:id/tracking', asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .select('deliveryStatus trackingNumber estimatedDelivery orderDate');

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.buyerId.toString() !== req.user.buyerId) {
    throw new ForbiddenError('Not authorized to view this order');
  }

  res.json({
    success: true,
    data: order
  });
}));

module.exports = router; 