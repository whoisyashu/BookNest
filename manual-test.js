const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test credentials
const SELLER_CREDENTIALS = {
  email: 'john@bookstore.com',
  password: 'password123'
};

const BUYER_CREDENTIALS = {
  email: 'alice@email.com',
  password: 'password123'
};

// Helper function to make requests
const makeRequest = async (method, url, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
};

// Manual testing functions
const testPublicEndpoints = async () => {
  console.log('\n🌐 Testing Public Endpoints...');
  
  // Test health check
  const health = await makeRequest('GET', '/health');
  console.log('Health Check:', health.success ? '✅' : '❌', health.data || health.error);
  
  // Test books endpoint
  const books = await makeRequest('GET', '/books');
  console.log('Books:', books.success ? '✅' : '❌', 
    books.success ? `${books.data.length} books found` : books.error);
  
  // Test auth info
  const authInfo = await makeRequest('GET', '/auth');
  console.log('Auth Info:', authInfo.success ? '✅' : '❌', authInfo.data || authInfo.error);
};

const testSellerLogin = async () => {
  console.log('\n👨‍💼 Testing Seller Login...');
  
  const login = await makeRequest('POST', '/auth/seller/login', SELLER_CREDENTIALS);
  
  if (login.success) {
    console.log('✅ Seller login successful!');
    console.log('   Token:', login.data.token.substring(0, 20) + '...');
    console.log('   Seller:', login.data.seller.name);
    return login.data.token;
  } else {
    console.log('❌ Seller login failed:', login.error);
    return null;
  }
};

const testBuyerLogin = async () => {
  console.log('\n🛒 Testing Buyer Login...');
  
  const login = await makeRequest('POST', '/auth/buyer/login', BUYER_CREDENTIALS);
  
  if (login.success) {
    console.log('✅ Buyer login successful!');
    console.log('   Token:', login.data.token.substring(0, 20) + '...');
    console.log('   Buyer:', login.data.buyer.name);
    return login.data.token;
  } else {
    console.log('❌ Buyer login failed:', login.error);
    return null;
  }
};

const testSellerEndpoints = async (token) => {
  console.log('\n🔒 Testing Seller Protected Endpoints...');
  
  // Test seller profile
  const profile = await makeRequest('GET', '/seller/profile', null, token);
  console.log('Profile:', profile.success ? '✅' : '❌', 
    profile.success ? profile.data.name : profile.error);
  
  // Test seller books
  const books = await makeRequest('GET', '/seller/books', null, token);
  console.log('Books:', books.success ? '✅' : '❌', 
    books.success ? `${books.data.length} books` : books.error);
  
  // Test seller orders
  const orders = await makeRequest('GET', '/seller/orders', null, token);
  console.log('Orders:', orders.success ? '✅' : '❌', 
    orders.success ? `${orders.data.length} orders` : orders.error);
};

const testBuyerEndpoints = async (token) => {
  console.log('\n🔒 Testing Buyer Protected Endpoints...');
  
  // Test buyer profile
  const profile = await makeRequest('GET', '/buyer/profile', null, token);
  console.log('Profile:', profile.success ? '✅' : '❌', 
    profile.success ? profile.data.name : profile.error);
  
  // Test buyer cart
  const cart = await makeRequest('GET', '/cart', null, token);
  console.log('Cart:', cart.success ? '✅' : '❌', 
    cart.success ? `${cart.data.items?.length || 0} items` : cart.error);
  
  // Test buyer wishlist
  const wishlist = await makeRequest('GET', '/buyer/wishlist', null, token);
  console.log('Wishlist:', wishlist.success ? '✅' : '❌', 
    wishlist.success ? `${wishlist.data.books?.length || 0} books` : wishlist.error);
};

const testBookOperations = async (sellerToken, buyerToken) => {
  console.log('\n📚 Testing Book Operations...');
  
  // Get all books
  const books = await makeRequest('GET', '/books');
  if (!books.success) {
    console.log('❌ Could not fetch books');
    return;
  }
  
  const firstBook = books.data[0];
  console.log('✅ Found books, testing with:', firstBook.title);
  
  // Test getting a specific book
  const book = await makeRequest('GET', `/books/${firstBook._id}`);
  console.log('Get Book:', book.success ? '✅' : '❌', 
    book.success ? book.data.title : book.error);
  
  // Test adding book to cart (buyer)
  if (buyerToken) {
    const addToCart = await makeRequest('POST', '/cart/add', {
      bookId: firstBook._id,
      quantity: 1
    }, buyerToken);
    console.log('Add to Cart:', addToCart.success ? '✅' : '❌', 
      addToCart.success ? 'Book added' : addToCart.error);
  }
};

// Main test function
const runManualTests = async () => {
  console.log('🧪 Manual API Testing for BookNest\n');
  console.log('Make sure your server is running on http://localhost:3000\n');
  
  try {
    // Test public endpoints
    await testPublicEndpoints();
    
    // Test seller authentication
    const sellerToken = await testSellerLogin();
    
    // Test buyer authentication
    const buyerToken = await testBuyerLogin();
    
    // Test protected endpoints
    if (sellerToken) {
      await testSellerEndpoints(sellerToken);
    }
    
    if (buyerToken) {
      await testBuyerEndpoints(buyerToken);
    }
    
    // Test book operations
    await testBookOperations(sellerToken, buyerToken);
    
    console.log('\n🎉 Manual testing completed!');
    console.log('\n💡 Tips for further testing:');
    console.log('- Use the tokens above to test other endpoints');
    console.log('- Try different HTTP methods (POST, PUT, DELETE)');
    console.log('- Test error cases with invalid data');
    console.log('- Test authorization with invalid tokens');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runManualTests();
}

module.exports = {
  makeRequest,
  testPublicEndpoints,
  testSellerLogin,
  testBuyerLogin,
  testSellerEndpoints,
  testBuyerEndpoints,
  testBookOperations
}; 