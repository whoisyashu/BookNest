// Simple Fake Payment Gateway

// Cart Management
class CartManager {
  constructor() {
    this.items = [];
    this.deliveryCharge = 60;
    this.loadCart();
  }

  loadCart() {
    const savedCart = localStorage.getItem('testCart');
    if (savedCart) {
      this.items = JSON.parse(savedCart);
    } else {
      // Add test item to cart
      this.addItem({
        id: 1,
        name: "The Great Gatsby",
        price: 681,
        image: "assets/images/book.webp"
      }, 1);
      this.saveCart();
    }
  }

  saveCart() {
    localStorage.setItem('testCart', JSON.stringify(this.items));
  }

  addItem(product, quantity = 1) {
    const existingItem = this.items.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        ...product,
        quantity: quantity
      });
    }
    this.saveCart();
    this.updateCartDisplay();
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartDisplay();
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this.saveCart();
        this.updateCartDisplay();
      }
    }
  }

  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getGrandTotal() {
    return this.getTotal() + this.deliveryCharge;
  }

  clearCart() {
    this.items = [];
    this.saveCart();
    this.updateCartDisplay();
  }

  updateCartDisplay() {
    // Update cart items display
    const cartContainer = document.querySelector('.cart-item');
    if (cartContainer && this.items.length > 0) {
      const item = this.items[0]; // For single item display
      const itemImage = cartContainer.querySelector('.item-image');
      const itemName = cartContainer.querySelector('.item-details h2');
      const itemPrice = cartContainer.querySelector('.item-price');
      const quantityDisplay = cartContainer.querySelector('.quantity-display');

      if (itemImage) itemImage.src = item.image;
      if (itemName) itemName.textContent = item.name;
      if (itemPrice) itemPrice.textContent = `₹${item.price * item.quantity}`;
      if (quantityDisplay) quantityDisplay.textContent = item.quantity;
    }

    // Update order summary
    this.updateOrderSummary();
  }

  updateOrderSummary() {
    const orderAmount = document.querySelector('.summary-row dd');
    const totalAmount = document.querySelector('.total dd');

    if (orderAmount) orderAmount.textContent = `₹${this.getTotal()}`;
    if (totalAmount) totalAmount.textContent = `₹${this.getGrandTotal()}`;
  }
}

// Fake Payment Gateway
class PaymentGateway {
  constructor() {
    this.selectedMethod = null;
    this.selectedCard = null;
    this.processing = false;
  }

  selectPaymentMethod(method) {
    this.selectedMethod = method;
    console.log(`Selected payment method: ${method}`);
  }

  selectCard(cardId) {
    this.selectedCard = cardId;
    console.log(`Selected card: ${cardId}`);
  }

  async processPayment(amount) {
    if (!this.selectedMethod) {
      throw new Error('Please select a payment method');
    }

    this.processing = true;
    this.showProcessingUI();

    // Simulate payment processing
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.processing = false;
        this.hideProcessingUI();

        // Simulate success/failure (90% success rate)
        const success = Math.random() > 0.1;
        
        if (success) {
          this.showOrderConfirmation(amount);
          resolve({
            success: true,
            transactionId: this.generateTransactionId(),
            amount: amount,
            method: this.selectedMethod,
            card: this.selectedCard
          });
        } else {
          this.showErrorMessage();
          reject(new Error('Payment failed. Please try again.'));
        }
      }, 2000);
    });
  }

  generateTransactionId() {
    return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }

  showProcessingUI() {
    const payButton = document.querySelector('.pay-now');
    if (payButton) {
      payButton.textContent = 'Processing...';
      payButton.disabled = true;
      payButton.style.opacity = '0.7';
    }
  }

  hideProcessingUI() {
    const payButton = document.querySelector('.pay-now');
    if (payButton) {
      payButton.textContent = 'Pay Now';
      payButton.disabled = false;
      payButton.style.opacity = '1';
    }
  }

  showOrderConfirmation(amount) {
    // Get cart data
    const cartData = JSON.parse(localStorage.getItem('paymentCartData') || '{}');
    const address = cartData.address || 'mathura';
    
    // Create order confirmation modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 15px;
      text-align: center;
      max-width: 400px;
      width: 90%;
    `;
    
    const transactionId = this.generateTransactionId();
    
    modalContent.innerHTML = `
      <div style="margin-bottom: 20px;">
        <div style="width: 60px; height: 60px; background: #4CAF50; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-size: 30px;">✓</span>
        </div>
        <h2 style="color: #4CAF50; margin: 0 0 10px 0;">Order Confirmed!</h2>
        <p style="color: #666; margin: 0;">Your order has been successfully placed.</p>
      </div>
      
      <div style="text-align: left; margin: 20px 0; padding: 15px; background: #f8f8f8; border-radius: 8px;">
        <div style="margin-bottom: 10px;">
          <strong>Transaction ID:</strong> ${transactionId}
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Amount Paid:</strong> ₹${amount}
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Payment Method:</strong> ${this.selectedMethod}
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Delivery Address:</strong> ${address}
        </div>
      </div>
      
      <div style="margin: 20px 0; padding: 15px; background: #e8f5e8; border-radius: 8px; border-left: 4px solid #4CAF50;">
        <p style="margin: 0; color: #2e7d32;">
          <strong>📦 Your order will be delivered to ${address} within 3-5 business days.</strong>
        </p>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
          You will receive tracking updates via email and SMS.
        </p>
      </div>
      
      <button onclick="closeOrderConfirmation()" style="
        background: #4CAF50;
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
        margin-top: 10px;
      ">Continue Shopping</button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Clear cart data
    localStorage.removeItem('paymentCartData');
    localStorage.removeItem('testCart');
    
    // Make close function globally accessible
    window.closeOrderConfirmation = function() {
      modal.remove();
      window.location.href = 'cart.html';
    };
  }

  showErrorMessage() {
    this.showMessage('Payment failed. Please try again.', 'error');
  }

  showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `payment-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      z-index: 1000;
      ${type === 'success' ? 'background-color: #4CAF50;' : 'background-color: #f44336;'}
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.remove();
    }, 5000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const cart = new CartManager();
  const payment = new PaymentGateway();
  
  // Make cart globally accessible
  window.cart = cart;
  
  // Initialize cart display
  cart.updateCartDisplay();
  
  // Add payment event listeners
  addPaymentEventListeners(cart, payment);
  
  console.log('Payment gateway initialized');
});

// Add payment event listeners
function addPaymentEventListeners(cart, payment) {
  // Payment method selection
  const paymentOptions = document.querySelectorAll('.payment-option-header');
  paymentOptions.forEach(option => {
    option.addEventListener('click', function() {
      const methodName = this.querySelector('span').textContent;
      payment.selectPaymentMethod(methodName);
    });
  });

  // Card selection
  const radioButtons = document.querySelectorAll('input[type="radio"]');
  radioButtons.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.checked) {
        const cardName = this.closest('label').querySelector('span').textContent;
        payment.selectCard(cardName);
      }
    });
  });

  // Pay now button
  const payButton = document.querySelector('.pay-now');
  if (payButton) {
    payButton.addEventListener('click', async function(e) {
      e.preventDefault();
      
              try {
          const result = await payment.processPayment(cart.getGrandTotal());
          console.log('Payment successful:', result);
          
        } catch (error) {
          console.log('Payment failed:', error.message);
        }
    });
  }

  // Quantity adjustment
  const minusBtn = document.querySelector('.minus-btn');
  const plusBtn = document.querySelector('.plus-btn');
  
  if (minusBtn && plusBtn) {
    minusBtn.addEventListener('click', function() {
      const currentQuantity = parseInt(document.querySelector('.quantity-display').textContent);
      if (currentQuantity > 1) {
        cart.updateQuantity(1, currentQuantity - 1);
      }
    });
    
    plusBtn.addEventListener('click', function() {
      const currentQuantity = parseInt(document.querySelector('.quantity-display').textContent);
      cart.updateQuantity(1, currentQuantity + 1);
    });
  }
} 