// BookExchange - Cart JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    initCart();
    loadCartItems();
});

// Initialize cart
function initCart() {
    // Initialize checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
}

// Load cart items
async function loadCartItems() {
    try {
        const response = await fetch('../backend/cart.php');
        const data = await response.json();
        
        if (data.success) {
            displayCartItems(data.data);
            updateCartSummary(data.data);
        } else {
            console.error('Error loading cart items:', data.message);
            showNotification('Error loading cart items', 'error');
        }
    } catch (error) {
        console.error('Error loading cart items:', error);
        showNotification('Error loading cart items', 'error');
    }
}

// Display cart items
function displayCartItems(items) {
    const container = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-cart" id="emptyCart">
                <div class="empty-cart-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some books to get started!</p>
                <a href="buyer-dashboard.html" class="btn btn-primary">Browse Books</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="cart-item" data-book-id="${item.book_id}">
            <div class="cart-item-image">
                <img src="${item.image_path || '../assets/images/book-placeholder.jpg'}" alt="${item.title}">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.title}</h3>
                <p class="cart-item-author">By ${item.author}</p>
                <div class="cart-item-info">
                    <span class="cart-item-condition">Condition: ${item.condition}</span>
                    <span class="cart-item-seller">Sold by: ${item.first_name} ${item.last_name}</span>
                </div>
            </div>
            <div class="cart-item-price">
                <div class="price">$${item.price}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.book_id}, ${item.quantity - 1})">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.book_id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <div class="cart-item-actions">
                <button class="btn-remove" onclick="removeFromCart(${item.book_id})">Remove</button>
            </div>
        </div>
    `).join('');
}

// Update cart summary
function updateCartSummary(items) {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const shipping = 5.99;
    const total = subtotal + shipping;
    
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    
    if (checkoutBtn) {
        checkoutBtn.disabled = items.length === 0;
    }
}

// Update quantity
async function updateQuantity(bookId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(bookId);
        return;
    }
    
    try {
        const response = await fetch('../backend/cart.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=update_quantity&book_id=${bookId}&quantity=${newQuantity}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadCartItems(); // Reload cart items
            updateCartCount(); // Update cart count in navigation
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        showNotification('Error updating quantity', 'error');
    }
}

// Remove from cart
async function removeFromCart(bookId) {
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
        return;
    }
    
    try {
        const response = await fetch('../backend/cart.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=remove&book_id=${bookId}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Item removed from cart', 'success');
            loadCartItems(); // Reload cart items
            updateCartCount(); // Update cart count in navigation
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        showNotification('Error removing item from cart', 'error');
    }
}

// Handle checkout
function handleCheckout() {
    // This would typically redirect to a checkout page or open a checkout modal
    showNotification('Checkout functionality coming soon!', 'info');
}

// Update cart count
async function updateCartCount() {
    try {
        const response = await fetch('../backend/cart.php');
        const data = await response.json();
        
        if (data.success) {
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                cartCount.textContent = data.data.length;
            }
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('user_id') !== null;
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#2596be'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
}

// Add CSS for cart specific styles
const style = document.createElement('style');
style.textContent = `
    .cart-section {
        padding: 80px 0;
        background-color: #f8f9fa;
        min-height: 80vh;
    }
    
    .cart-header {
        text-align: center;
        margin-bottom: 3rem;
    }
    
    .cart-header h1 {
        font-size: 2.5rem;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 1rem;
    }
    
    .cart-header p {
        font-size: 1.125rem;
        color: #666;
    }
    
    .cart-content {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 3rem;
        align-items: start;
    }
    
    .cart-items {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }
    
    .cart-item {
        display: grid;
        grid-template-columns: 120px 1fr auto auto;
        gap: 1.5rem;
        padding: 1.5rem;
        border-bottom: 1px solid #e9ecef;
        align-items: center;
    }
    
    .cart-item:last-child {
        border-bottom: none;
    }
    
    .cart-item-image {
        width: 120px;
        height: 150px;
        overflow: hidden;
        border-radius: 8px;
    }
    
    .cart-item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .cart-item-details {
        flex: 1;
    }
    
    .cart-item-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 0.5rem;
    }
    
    .cart-item-author {
        color: #666;
        margin-bottom: 0.5rem;
    }
    
    .cart-item-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.875rem;
        color: #666;
    }
    
    .cart-item-price {
        text-align: center;
    }
    
    .cart-item-price .price {
        font-size: 1.5rem;
        font-weight: 700;
        color: #2596be;
        margin-bottom: 1rem;
    }
    
    .quantity-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: center;
    }
    
    .quantity-btn {
        width: 32px;
        height: 32px;
        border: 1px solid #e9ecef;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: #666;
    }
    
    .quantity-btn:hover {
        background-color: #f8f9fa;
        border-color: #2596be;
        color: #2596be;
    }
    
    .quantity {
        min-width: 40px;
        text-align: center;
        font-weight: 500;
    }
    
    .cart-item-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .btn-remove {
        background: none;
        border: 1px solid #dc3545;
        color: #dc3545;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.3s ease;
    }
    
    .btn-remove:hover {
        background-color: #dc3545;
        color: white;
    }
    
    .cart-summary {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 100px;
    }
    
    .cart-summary h3 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 1.5rem;
    }
    
    .summary-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e9ecef;
    }
    
    .summary-row.total {
        font-size: 1.25rem;
        font-weight: 700;
        color: #2c3e50;
        border-bottom: none;
        margin-bottom: 2rem;
    }
    
    .empty-cart {
        text-align: center;
        padding: 4rem 2rem;
    }
    
    .empty-cart-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
    
    .empty-cart h3 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        color: #2c3e50;
    }
    
    .empty-cart p {
        color: #666;
        margin-bottom: 2rem;
    }
    
    @media (max-width: 768px) {
        .cart-content {
            grid-template-columns: 1fr;
        }
        
        .cart-item {
            grid-template-columns: 1fr;
            text-align: center;
        }
        
        .cart-item-image {
            width: 100px;
            height: 120px;
            margin: 0 auto;
        }
        
        .cart-summary {
            position: static;
        }
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
`;
document.head.appendChild(style);
