# BookNest Backend - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your configuration
# At minimum, set:
# - JWT_SECRET (a long random string)
# - MONGODB_URI (your MongoDB connection string)
```

### 3. Test Your Setup
```bash
npm run test-setup
```

### 4. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 5. Verify It's Working
Visit: `http://localhost:5000/health`

You should see:
```json
{
  "status": "OK",
  "message": "BookNest API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## 🔧 Configuration Options

### MongoDB Setup
- **Local MongoDB**: `mongodb://localhost:27017/booknest`
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/booknest`

### JWT Configuration
- **JWT_SECRET**: Use a long, random string (at least 32 characters)
- **JWT_EXPIRE**: Token expiration time (default: 7d)

### Rate Limiting
- **RATE_LIMIT_MAX_REQUESTS**: Requests per window (default: 100)
- **RATE_LIMIT_WINDOW_MS**: Time window in milliseconds (default: 15 minutes)

## 📚 API Documentation

Once the server is running, you can:

1. **Register a Seller**:
   ```bash
   POST http://localhost:5000/api/auth/seller/register
   ```

2. **Register a Buyer**:
   ```bash
   POST http://localhost:5000/api/auth/buyer/register
   ```

3. **Browse Books**:
   ```bash
   GET http://localhost:5000/api/books
   ```

See the full [README.md](README.md) for complete API documentation.

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server with auto-restart
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test-setup` - Test your setup configuration

### Project Structure
```
BookNest/
├── models/          # MongoDB models (24 entities)
├── routes/          # API route handlers
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── uploads/         # File uploads
├── logs/            # Application logs
└── server.js        # Main server file
```

## 🔒 Security Features

- JWT authentication
- Password hashing with bcryptjs
- Input validation with express-validator
- Rate limiting
- CORS protection
- Helmet security headers

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check your MONGODB_URI in .env
   - Verify network connectivity

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing process: `npx kill-port 5000`

3. **JWT Errors**
   - Ensure JWT_SECRET is set in .env
   - Use a long, random string for JWT_SECRET

4. **Missing Dependencies**
   - Run `npm install` again
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Getting Help

1. Check the [README.md](README.md) for detailed documentation
2. Review [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for architecture details
3. Test your setup with `npm run test-setup`

## 🎯 Next Steps

1. **Set up your frontend** to connect to the API
2. **Configure payment processing** (Stripe, PayPal, etc.)
3. **Set up file storage** (AWS S3, Cloudinary, etc.)
4. **Add email notifications** (SendGrid, Mailgun, etc.)
5. **Deploy to production** (Heroku, AWS, DigitalOcean, etc.)

---

**Happy coding! 📚✨** 