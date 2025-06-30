# BookNest Backend - Project Structure

## Overview
A comprehensive backend API for a book marketplace platform with 24 MongoDB models, JWT authentication, and role-based access control.

## Directory Structure

```
BookNest/
├── server.js                 # Main server file
├── package.json              # Dependencies and scripts
├── env.example              # Environment variables template
├── README.md                # Comprehensive API documentation
├── PROJECT_STRUCTURE.md     # This file
│
├── middleware/              # Custom middleware
│   ├── auth.js             # JWT authentication middleware
│   ├── asyncHandler.js     # Async error handler wrapper
│   ├── errorHandler.js     # Global error handling
│   └── notFound.js         # 404 handler
│
├── models/                  # MongoDB models (24 total)
│   ├── SellerTier.js       # Seller subscription tiers
│   ├── Seller.js           # Seller information & auth
│   ├── Buyer.js            # Buyer information & auth
│   ├── Book.js             # Book listings
│   ├── Order.js            # Order management
│   ├── Cart.js             # Shopping cart
│   ├── CartItem.js         # Cart items
│   ├── Review.js           # Book reviews & ratings
│   ├── OnboardingStatus.js # Seller onboarding progress
│   ├── Document.js         # Seller verification docs
│   ├── PaymentAccount.js   # Seller payment methods
│   ├── ReturnPolicy.js     # Seller return policies
│   ├── InventoryLog.js     # Inventory tracking
│   ├── Promotion.js        # Book promotions
│   ├── ReturnRequest.js    # Buyer return requests
│   ├── SellerReward.js     # Gamified rewards
│   ├── SellerBadge.js      # Achievement badges
│   ├── Referral.js         # Seller referral system
│   ├── Payment.js          # Payment processing
│   ├── Wishlist.js         # Buyer wishlists
│   ├── Event.js            # Publisher events
│   ├── Merchandise.js      # Non-book items
│   ├── PremiumContent.js   # Digital products
│   └── BarterRequest.js    # Book/item trade system
│
├── routes/                  # API route handlers
│   ├── auth.js             # Authentication routes
│   ├── seller.js           # Seller-specific routes
│   ├── buyer.js            # Buyer-specific routes
│   ├── book.js             # Public book routes
│   ├── order.js            # Order management routes
│   ├── cart.js             # Cart operations
│   ├── review.js           # Review management
│   └── admin.js            # Administrative routes
│
└── utils/                   # Utility functions
    ├── errors.js           # Custom error classes
    └── jwt.js              # JWT token utilities
```

## Key Features Implemented

### 🔐 Authentication & Authorization
- **JWT-based authentication** for both sellers and buyers
- **Role-based access control** (seller, buyer, admin)
- **Password hashing** with bcryptjs
- **Token refresh** mechanism
- **Optional authentication** for public routes

### 📚 Book Management
- **CRUD operations** for books
- **Inventory tracking** with automatic updates
- **Search functionality** with text indexing
- **Filtering and sorting** (genre, price, condition, format)
- **Image support** for book covers
- **Rating system** with automatic calculation

### 🛒 Shopping Experience
- **Shopping cart** with persistent storage
- **Wishlist** functionality
- **Order management** with status tracking
- **Return requests** with approval workflow
- **Payment integration** ready

### 👥 User Management
- **Separate seller and buyer systems**
- **Profile management** with address support
- **Document verification** for sellers
- **Onboarding progress** tracking
- **Seller tiers** with different benefits

### 🏪 Seller Features
- **Dashboard** with sales analytics
- **Order management** with status updates
- **Return request handling**
- **Payment account management**
- **Return policy configuration**
- **Gamification** with rewards and badges

### 🛍️ Buyer Features
- **Order history** and tracking
- **Review system** with purchase verification
- **Cart and wishlist** management
- **Return requests** with reason tracking
- **Profile preferences** and settings

### 🔧 Administrative Features
- **Dashboard** with platform statistics
- **User management** (sellers and buyers)
- **Document verification** workflow
- **Seller tier management**
- **Order oversight** and monitoring
- **Return request management**

### 🎯 Advanced Features
- **Gamification system** with rewards and badges
- **Referral system** for sellers
- **Event management** for publishers
- **Merchandise support** for non-book items
- **Premium content** for digital products
- **Barter system** for item trading
- **Promotion management** with various types

## API Endpoints Summary

### Authentication Routes (`/api/auth`)
- `POST /seller/register` - Seller registration
- `POST /seller/login` - Seller login
- `POST /buyer/register` - Buyer registration
- `POST /buyer/login` - Buyer login
- `GET /me` - Get current user
- `POST /refresh` - Refresh token

### Seller Routes (`/api/seller`)
- `GET /profile` - Get seller profile
- `PUT /profile` - Update seller profile
- `GET /books` - Get seller's books
- `POST /books` - Create new book
- `PUT /books/:id` - Update book
- `DELETE /books/:id` - Delete book
- `GET /orders` - Get seller's orders
- `PUT /orders/:id/status` - Update order status
- `GET /returns` - Get return requests
- `PUT /returns/:id/status` - Update return status
- `GET /dashboard` - Seller dashboard

### Buyer Routes (`/api/buyer`)
- `GET /profile` - Get buyer profile
- `PUT /profile` - Update buyer profile
- `GET /orders` - Get buyer's orders
- `GET /cart` - Get shopping cart
- `POST /cart/items` - Add item to cart
- `GET /wishlist` - Get wishlist
- `POST /wishlist/books` - Add book to wishlist
- `POST /reviews` - Create review

### Book Routes (`/api/books`)
- `GET /` - Get all books (public)
- `GET /:id` - Get book by ID
- `GET /search` - Search books
- `GET /seller/:sellerId` - Get books by seller
- `GET /popular` - Get popular books
- `GET /new-arrivals` - Get new arrivals
- `GET /:id/reviews` - Get book reviews

### Order Routes (`/api/orders`)
- `POST /checkout` - Create order from cart
- `POST /` - Create single book order
- `GET /:id` - Get order details
- `PUT /:id/cancel` - Cancel order
- `GET /:id/tracking` - Get order tracking

### Review Routes (`/api/reviews`)
- `GET /book/:bookId` - Get book reviews
- `GET /book/:bookId/stats` - Get review statistics

### Admin Routes (`/api/admin`)
- `GET /dashboard` - Admin dashboard
- `GET /sellers` - Get all sellers
- `GET /sellers/:id` - Get seller details
- `PUT /sellers/:id/verify` - Verify seller
- `GET /buyers` - Get all buyers
- `GET /books` - Get all books
- `PUT /books/:id/status` - Update book status
- `GET /orders` - Get all orders
- `GET /documents/pending` - Get pending documents
- `PUT /documents/:id/verify` - Verify document
- `GET /tiers` - Get seller tiers
- `POST /tiers` - Create seller tier
- `PUT /tiers/:id` - Update seller tier
- `DELETE /tiers/:id` - Delete seller tier
- `GET /returns` - Get return requests

## Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcryptjs
- **Input Validation** with express-validator
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for cross-origin requests
- **Security Headers** with helmet
- **Error Handling** with custom error classes
- **Role-based Authorization** for route protection

## Database Design

The backend uses **MongoDB** with **Mongoose ODM** and includes:

- **24 comprehensive models** covering all marketplace aspects
- **Proper indexing** for optimal query performance
- **Data validation** at the schema level
- **Relationship management** with references and population
- **Virtual fields** for computed properties
- **Middleware hooks** for automatic operations

## Error Handling

Centralized error handling with custom error classes:
- `BadRequestError` (400) - Invalid request data
- `UnauthorizedError` (401) - Authentication required
- `ForbiddenError` (403) - Insufficient permissions
- `NotFoundError` (404) - Resource not found
- `ConflictError` (409) - Resource conflict
- `ValidationError` (422) - Validation failed
- `InternalServerError` (500) - Server error

## Pagination

Most list endpoints support pagination with:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- Response includes pagination metadata

## Environment Configuration

Key environment variables:
- `PORT` - Server port
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - Token expiration time
- `RATE_LIMIT_*` - Rate limiting configuration

## Development & Deployment

### Development
```bash
npm install
cp env.example .env
npm run dev
```

### Production
```bash
npm install
npm start
```

### Testing
```bash
npm test
```

This backend provides a solid foundation for a comprehensive book marketplace with all the essential features for sellers, buyers, and administrators. 