const jwt = require('jsonwebtoken');

// Generate oken
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
};

// Verify oken
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw error;
  }
};

// Generate token payload for seller
const generateSellerTokenPayload = (seller) => {
  return {
    id: seller._id,
    email: seller.email,
    role: 'seller',
    sellerId: seller._id
  };
};

// Generate token payload for buyer
const generateBuyerTokenPayload = (buyer) => {
  return {
    id: buyer._id,
    email: buyer.email,
    role: 'buyer',
    buyerId: buyer._id
  };
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  generateSellerTokenPayload,
  generateBuyerTokenPayload
}; 