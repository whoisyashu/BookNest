const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const sellerRoutes = require('./routes/seller');
const buyerRoutes = require('./routes/buyer');
const bookRoutes = require('./routes/book');
const orderRoutes = require('./routes/order');
const cartRoutes = require('./routes/cart');
const reviewRoutes = require('./routes/review');
const adminRoutes = require('./routes/admin');

const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
let corsOptions;

if (process.env.NODE_ENV === 'development') {
  // More permissive CORS for development
  corsOptions = {
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
  };
  console.log('Development CORS: Allowing all origins');
} else {
  // Strict CORS for production
  corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'http://localhost:8000',
        'http://localhost:3000', 
        'http://localhost:3001',
        'http://127.0.0.1:8000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      ];
      
      // In production, also allow the frontend URL if specified
      if (process.env.FRONTEND_URL) {
        allowedOrigins.push(process.env.FRONTEND_URL);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
  };
  console.log('Production CORS: Restricted origins');
}

console.log('CORS configuration:', corsOptions);

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Debug middleware for development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'BookNest API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to BookNest API',
    version: '1.0.0',
    description: 'A comprehensive book marketplace API',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      books: '/api/books',
      sellers: '/api/seller',
      buyers: '/api/buyer',
      orders: '/api/orders',
      cart: '/api/cart',
      reviews: '/api/reviews',
      admin: '/api/admin'
    },
    documentation: 'See README.md for complete API documentation',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// MongoDB connection
const connectDB = async () => {
  try {
    // Debug logging
    console.log('Environment variables:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MONGODB_URI_PROD:', process.env.MONGODB_URI_PROD ? 'SET' : 'NOT SET');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    
    let mongoUri = process.env.NODE_ENV === 'production' 
      ? process.env.MONGODB_URI_PROD 
      : process.env.MONGODB_URI;
    
    console.log('Using MongoDB URI:', mongoUri ? 'AVAILABLE' : 'UNDEFINED');
    
    // Fallback for testing
    if (!mongoUri) {
      console.log('Using fallback MongoDB URI');
      mongoUri = 'mongodb+srv://MCBZvJHnwSJynTV0:MCBZvJHnwSJynTV0@booknest.wwxa5bj.mongodb.net/booknest?retryWrites=true&w=majority&appName=BookNest';
    }
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  // Set NODE_ENV if not defined
  if (!process.env.NODE_ENV) {
    // Default to development for local testing
    process.env.NODE_ENV = 'development';
    console.log('NODE_ENV not set, defaulting to development');
  }
  
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    console.log(`CORS is ${process.env.NODE_ENV === 'development' ? 'allowing all origins' : 'restricted'}`);
  });
};

startServer();

module.exports = app; 
