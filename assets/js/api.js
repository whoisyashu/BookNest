// API Configuration
const API_BASE_URL = 'https://booknest-12tt.onrender.com/api';

// API Functions
const api = {
  // Seller Registration
  async registerSeller(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/seller/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Buyer Registration
  async registerBuyer(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/buyer/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Seller Login
  async loginSeller(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/seller/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Buyer Login
  async loginBuyer(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/buyer/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
};

// Utility Functions
const utils = {
  // Save user data to localStorage
  saveUserData(userData, userType) {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', userType);
    localStorage.setItem('token', userData.token);
  },

  // Get user data from localStorage
  getUserData() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get user type from localStorage
  getUserType() {
    return localStorage.getItem('userType');
  },

  // Get token from localStorage
  getToken() {
    return localStorage.getItem('token');
  },

  // Clear user data from localStorage
  clearUserData() {
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('token');
  },

  // Check if user is logged in
  isLoggedIn() {
    return !!localStorage.getItem('token');
  },

  // Redirect to appropriate dashboard
  redirectToDashboard(userType) {
    if (userType === 'seller') {
      window.location.href = 'seller-dashboard.html';
    } else if (userType === 'customer') {
      window.location.href = 'customer-dashboard.html';
    }
  },

  // Show loading state
  showLoading(button) {
    button.disabled = true;
    button.innerHTML = '<span>Loading...</span>';
  },

  // Hide loading state
  hideLoading(button, originalText) {
    button.disabled = false;
    button.innerHTML = originalText;
  },

  // Show error message
  showError(message) {
    alert(message); // You can replace this with a better UI component
  },

  // Show success message
  showSuccess(message) {
    alert(message); // You can replace this with a better UI component
  }
};