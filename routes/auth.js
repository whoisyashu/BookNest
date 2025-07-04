const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const { generateToken, generateSellerTokenPayload, generateBuyerTokenPayload } = require('../utils/jwt');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');

const Seller = require('../models/Seller');
const Buyer = require('../models/Buyer');
const SellerTier = require('../models/SellerTier');
const Admin = require('../models/Admin');

const router = express.Router();

// @desc    Get auth endpoints info
// @route   GET /api/auth
// @access  Public
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'BookNest Authentication API',
    endpoints: {
      'Seller Registration': 'POST /api/auth/seller/register',
      'Seller Login': 'POST /api/auth/seller/login',
      'Buyer Registration': 'POST /api/auth/buyer/register',
      'Buyer Login': 'POST /api/auth/buyer/login',
      'Get Current User': 'GET /api/auth/me',
      'Refresh Token': 'POST /api/auth/refresh'
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// @desc    Register seller
// @route   POST /api/auth/seller/register
// @access  Public
router.post('/seller/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim(),
  body('tierId').isMongoId().withMessage('Valid tier ID is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const { name, email, password, phone, tierId } = req.body;

  // Check if seller already exists
  const existingSeller = await Seller.findOne({ email });
  if (existingSeller) {
    throw new BadRequestError('Seller with this email already exists');
  }

  // Verify tier exists
  const tier = await SellerTier.findById(tierId);
  if (!tier) {
    throw new BadRequestError('Invalid tier ID');
  }

  // Create seller
  const seller = await Seller.create({
    name,
    email,
    password,
    phone,
    tierId
  });

  // Generate token
  const tokenPayload = generateSellerTokenPayload(seller);
  const token = generateToken(tokenPayload);

  res.status(201).json({
    success: true,
    data: {
      seller,
      token
    }
  });
}));

// @desc    Register buyer
// @route   POST /api/auth/buyer/register
// @access  Public
router.post('/buyer/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const { name, email, password, phone, address } = req.body;

  // Check if buyer already exists
  const existingBuyer = await Buyer.findOne({ email });
  if (existingBuyer) {
    throw new BadRequestError('Buyer with this email already exists');
  }

  // Create buyer
  const buyer = await Buyer.create({
    name,
    email,
    password,
    phone,
    address
  });

  // Generate token
  const tokenPayload = generateBuyerTokenPayload(buyer);
  const token = generateToken(tokenPayload);

  res.status(201).json({
    success: true,
    data: {
      buyer,
      token
    }
  });
}));

// @desc    Login seller
// @route   POST /api/auth/seller/login
// @access  Public
router.post('/seller/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const { email, password } = req.body;

  // Check if seller exists
  const seller = await Seller.findOne({ email }).populate('tierId');
  if (!seller) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check if password matches
  const isMatch = await seller.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check if seller is active
  if (!seller.isActive) {
    throw new UnauthorizedError('Account is deactivated');
  }

  // Generate token
  const tokenPayload = generateSellerTokenPayload(seller);
  const token = generateToken(tokenPayload);

  res.json({
    success: true,
    data: {
      seller,
      token
    }
  });
}));

// @desc    Login buyer
// @route   POST /api/auth/buyer/login
// @access  Public
router.post('/buyer/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const { email, password } = req.body;

  // Check if buyer exists
  const buyer = await Buyer.findOne({ email });
  if (!buyer) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check if password matches
  const isMatch = await buyer.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check if buyer is active
  if (!buyer.isActive) {
    throw new UnauthorizedError('Account is deactivated');
  }

  // Generate token
  const tokenPayload = generateBuyerTokenPayload(buyer);
  const token = generateToken(tokenPayload);

  res.json({
    success: true,
    data: {
      buyer,
      token
    }
  });
}));

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
  let user;
  
  if (req.user.role === 'seller') {
    user = await Seller.findById(req.user.id).populate('tierId');
  } else if (req.user.role === 'buyer') {
    user = await Buyer.findById(req.user.id);
  }

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  res.json({
    success: true,
    data: {
      user,
      role: req.user.role
    }
  });
}));

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', [
  body('token').notEmpty().withMessage('Token is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const { token } = req.body;

  try {
    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    let user;
    if (decoded.role === 'seller') {
      user = await Seller.findById(decoded.id);
    } else if (decoded.role === 'buyer') {
      user = await Buyer.findById(decoded.id);
    }

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Generate new token
    const tokenPayload = decoded.role === 'seller' 
      ? generateSellerTokenPayload(user)
      : generateBuyerTokenPayload(user);
    const newToken = generateToken(tokenPayload);

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    throw new UnauthorizedError('Invalid refresh token');
  }
}));

// @desc    Login admin
// @route   POST /api/auth/admin/login
// @access  Public
router.post('/admin/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(errors.array()[0].msg);
  }

  const { email, password } = req.body;

  // Check if admin exists
  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check if password matches
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check if admin is active
  if (!admin.isActive) {
    throw new UnauthorizedError('Account is deactivated');
  }

  // Generate token
  const tokenPayload = {
    id: admin._id,
    email: admin.email,
    role: 'admin'
  };
  const token = generateToken(tokenPayload);

  res.json({
    success: true,
    data: {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      },
      token
    }
  });
}));

module.exports = router; 