# BookNest Backend API

A comprehensive backend API for a book marketplace platform built with Node.js, Express, MongoDB, and JWT authentication.

## Features

- **User Management**: Separate authentication for sellers and buyers
- **Book Management**: CRUD operations for books with inventory tracking
- **Order System**: Complete order lifecycle management
- **Cart & Wishlist**: Shopping cart and wishlist functionality
- **Review System**: Book reviews and ratings
- **Return Management**: Return request processing
- **Seller Tiers**: Subscription-based seller tiers with different benefits
- **Document Verification**: Seller document upload and verification
- **Payment Integration**: Payment processing and tracking
- **Admin Panel**: Administrative operations and oversight
- **Gamification**: Seller rewards and badges system
- **Advanced Features**: Events, merchandise, premium content, barter system

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, rate limiting
- **File Upload**: multer
- **Logging**: morgan

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd booknest-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/booknest
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

### Authentication Endpoints

#### Seller Registration
```http
POST /api/auth/seller/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "tierId": "tier_id_here"
}
```

#### Seller Login
```http
POST /api/auth/seller/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Buyer Registration
```http
POST /api/auth/buyer/register
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

#### Buyer Login
```http
POST /api/auth/buyer/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "password123"
}
```

### Book Endpoints

#### Get All Books
```http
GET /api/books?page=1&limit=10&genre=fiction&minPrice=10&maxPrice=50&sort=price_asc
```

#### Get Book by ID
```http
GET /api/books/:id
```

#### Search Books
```http
GET /api/books/search?q=harry potter&genre=fantasy&sort=rating
```

### Seller Endpoints

#### Get Seller Profile
```http
GET /api/seller/profile
Authorization: Bearer <token>
```

#### Update Seller Profile
```http
PUT /api/seller/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+1234567890",
  "bio": "Updated bio"
}
```

#### Get Seller Books
```http
GET /api/seller/books?page=1&limit=10
Authorization: Bearer <token>
```

#### Create Book
```http
POST /api/seller/books
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Book Title",
  "author": "Author Name",
  "ISBN": "9781234567890",
  "price": 29.99,
  "quantity": 10,
  "description": "Book description",
  "genre": "fiction",
  "condition": "new",
  "format": "paperback"
}
```

#### Update Book
```http
PUT /api/seller/books/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 24.99,
  "quantity": 15
}
```

#### Delete Book
```http
DELETE /api/seller/books/:id
Authorization: Bearer <token>
```

### Buyer Endpoints

#### Get Buyer Profile
```http
GET /api/buyer/profile
Authorization: Bearer <token>
```

#### Update Buyer Profile
```http
PUT /api/buyer/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+1234567890",
  "address": {
    "street": "456 Oak St",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90210",
    "country": "USA"
  }
}
```

#### Get Buyer Orders
```http
GET /api/buyer/orders?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Cart
```http
GET /api/buyer/cart
Authorization: Bearer <token>
```

#### Add Item to Cart
```http
POST /api/buyer/cart/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookId": "book_id_here",
  "quantity": 2
}
```

#### Get Wishlist
```http
GET /api/buyer/wishlist
Authorization: Bearer <token>
```

#### Add Book to Wishlist
```http
POST /api/buyer/wishlist/books
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookId": "book_id_here"
}
```

### Order Endpoints

#### Create Order from Cart
```http
POST /api/orders/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card",
  "notes": "Please deliver after 6 PM"
}
```

#### Create Single Book Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookId": "book_id_here",
  "quantity": 1,
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

#### Get Order Details
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Cancel Order
```http
PUT /api/orders/:id/cancel
Authorization: Bearer <token>
```

### Review Endpoints

#### Create Review
```http
POST /api/buyer/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookId": "book_id_here",
  "rating": 5,
  "comment": "Excellent book! Highly recommended."
}
```

#### Get Book Reviews
```http
GET /api/reviews/book/:bookId?page=1&limit=10
```

#### Get Review Statistics
```http
GET /api/reviews/book/:bookId/stats
```

### Admin Endpoints

#### Get Admin Dashboard
```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

#### Get All Sellers
```http
GET /api/admin/sellers?page=1&limit=10
Authorization: Bearer <token>
```

#### Verify Seller
```http
PUT /api/admin/sellers/:id/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "isVerified": true
}
```

#### Get Pending Documents
```http
GET /api/admin/documents/pending?page=1&limit=10
Authorization: Bearer <token>
```

#### Verify Document
```http
PUT /api/admin/documents/:id/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "verified": true,
  "rejectionReason": "Document is unclear"
}
```

## Database Schema

The API includes 24 comprehensive models covering all aspects of the book marketplace:

1. **SellerTier** - Seller subscription tiers
2. **Seller** - Seller information and authentication
3. **Buyer** - Buyer information and authentication
4. **Book** - Book listings with detailed information
5. **Order** - Order management and tracking
6. **Cart** - Shopping cart functionality
7. **CartItem** - Individual cart items
8. **Review** - Book reviews and ratings
9. **OnboardingStatus** - Seller onboarding progress
10. **Document** - Seller verification documents
11. **PaymentAccount** - Seller payment methods
12. **ReturnPolicy** - Seller return policies
13. **InventoryLog** - Inventory change tracking
14. **Promotion** - Book promotions and discounts
15. **ReturnRequest** - Buyer return requests
16. **SellerReward** - Gamified seller rewards
17. **SellerBadge** - Seller achievement badges
18. **Referral** - Seller referral system
19. **Payment** - Payment processing and tracking
20. **Wishlist** - Buyer wishlists
21. **Event** - Publisher-hosted events
22. **Merchandise** - Non-book items
23. **PremiumContent** - Digital products
24. **BarterRequest** - Book/item trade system

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: express-validator for request validation
- **Rate Limiting**: Protection against abuse
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Error Handling**: Comprehensive error management

## Error Handling

The API uses a centralized error handling system with custom error classes:

- `BadRequestError` (400) - Invalid request data
- `UnauthorizedError` (401) - Authentication required
- `ForbiddenError` (403) - Insufficient permissions
- `NotFoundError` (404) - Resource not found
- `ConflictError` (409) - Resource conflict
- `ValidationError` (422) - Validation failed
- `InternalServerError` (500) - Server error

## Pagination

Most list endpoints support pagination with the following query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

Response includes pagination metadata:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/booknest
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/booknest

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRE=30d

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Development

### Running Tests
```bash
npm test
```

### Code Formatting
```bash
npm run lint
```

### Database Seeding
```bash
npm run seed
```

## Production Deployment

1. Set environment variables for production
2. Use a production MongoDB instance
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Use a process manager like PM2
6. Configure proper logging and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the repository. #   B o o k N e s t  
 