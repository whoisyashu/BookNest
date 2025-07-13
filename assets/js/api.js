// API Configuration
const API_BASE_URL = 'https://booknest-12tt.onrender.com/api';

// API Functions
const api = {
  // Seller Registration
  async registerSeller(userData) {
    try {
      console.log('Sending seller registration data:', userData);
      
      const response = await fetch(`${API_BASE_URL}/auth/seller/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      console.log('Seller registration response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      return data;
    } catch (error) {
      console.error('Seller registration error:', error);
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
  },

  // Get seller profile
  async getSellerProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/seller/profile`, {
        headers: {
          'Authorization': `Bearer ${utils.getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load profile');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Update seller profile
  async updateSellerProfile(profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/seller/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${utils.getToken()}`
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get seller books
  async getSellerBooks() {
    try {
      const response = await fetch(`${API_BASE_URL}/books/seller`, {
        headers: {
          'Authorization': `Bearer ${utils.getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load books');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get seller stats
  async getSellerStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/seller/stats`, {
        headers: {
          'Authorization': `Bearer ${utils.getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load stats');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Delete book
  async deleteBook(bookId) {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${utils.getToken()}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete book');
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