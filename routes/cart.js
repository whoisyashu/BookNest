const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/auth');

const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Book = require('../models/Book');

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('buyer'));

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
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

// @desc    Get cart count
// @route   GET /api/cart/count
// @access  Private
router.get('/count', asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ buyerId: req.user.buyerId });

  if (!cart) {
    return res.json({
      success: true,
      data: { count: 0 }
    });
  }

  const count = await CartItem.countDocuments({ cartId: cart._id });

  res.json({
    success: true,
    data: { count }
  });
}));

module.exports = router; 