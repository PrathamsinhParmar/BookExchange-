// BookExchange - Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    initDashboard();
    loadBooks();
    loadRecentOrders();
    initSearchAndFilters();
});

// Initialize dashboard
function initDashboard() {
    // Update user name
    const userName = localStorage.getItem('user_name');
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    
    // Initialize search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadBooks();
            }, 500);
        });
    }
    
    // Initialize filters
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', loadBooks);
    }
    
    if (priceFilter) {
        priceFilter.addEventListener('change', loadBooks);
    }
}

// Load books
async function loadBooks() {
    try {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const priceFilter = document.getElementById('priceFilter');
        
        const params = new URLSearchParams();
        
        if (searchInput && searchInput.value) {
            params.append('search', searchInput.value);
        }
        
        if (categoryFilter && categoryFilter.value) {
            params.append('category', categoryFilter.value);
        }
        
        if (priceFilter && priceFilter.value) {
            const [min, max] = priceFilter.value.split('-');
            if (min) params.append('price_min', min);
            if (max) params.append('price_max', max);
        }
        
        const response = await fetch(`../backend/fetch-books.php?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
            displayBooks(data.data.books, 'booksGrid');
        } else {
            console.error('Error loading books:', data.message);
            showNotification('Error loading books', 'error');
        }
    } catch (error) {
        console.error('Error loading books:', error);
        showNotification('Error loading books', 'error');
    }
}

// Display books in grid
function displayBooks(books, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (books.length === 0) {
        container.innerHTML = '<p class="text-center">No books found.</p>';
        return;
    }
    
    container.innerHTML = books.map(book => `
        <div class="book-card" onclick="viewBookDetails(${book.id})">
            <div class="book-image">
                <img src="${book.image_path || '../assets/images/book-placeholder.jpg'}" alt="${book.title}">
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">By ${book.author}</p>
                ${book.isbn ? `<p class="book-isbn">ISBN: ${book.isbn}</p>` : ''}
                <div class="book-rating">
                    <span class="stars">${generateStars(book.avg_rating)}</span>
                    <span class="rating-text">(${book.avg_rating}) - ${book.review_count} reviews</span>
                </div>
                <div class="book-price">$${book.price}</div>
                <div class="book-actions">
                    <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${book.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load recent orders
async function loadRecentOrders() {
    try {
        // This would typically fetch from a backend endpoint
        // For now, we'll show placeholder data
        const ordersData = [
            {
                id: 'ORD001',
                book: 'The Great Gatsby',
                price: '$12.99',
                status: 'Delivered',
                date: '2024-01-15'
            },
            {
                id: 'ORD002',
                book: 'To Kill a Mockingbird',
                price: '$15.99',
                status: 'Shipped',
                date: '2024-01-20'
            }
        ];
        
        displayOrders(ordersData);
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Display orders
function displayOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No recent orders</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.book}</td>
            <td>${order.price}</td>
            <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
            <td>${formatDate(order.date)}</td>
        </tr>
    `).join('');
}

// Add to cart
async function addToCart(bookId) {
    try {
        const response = await fetch('../backend/cart.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=add&book_id=${bookId}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Book added to cart!', 'success');
            updateCartCount();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding book to cart', 'error');
    }
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

// View book details
function viewBookDetails(bookId) {
    window.location.href = `book-details.html?id=${bookId}`;
}

// Generate star rating display
function generateStars(rating) {
    const numRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '☆' : '') + 
           '☆'.repeat(emptyStars);
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
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

// Initialize search and filters
function initSearchAndFilters() {
    // This function is called from the main initialization
    // Additional search/filter functionality can be added here
}

// Add CSS for status badges
const style = document.createElement('style');
style.textContent = `
    .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 500;
        text-transform: uppercase;
    }
    
    .status-delivered {
        background-color: #d4edda;
        color: #155724;
    }
    
    .status-shipped {
        background-color: #cce5ff;
        color: #004085;
    }
    
    .status-pending {
        background-color: #fff3cd;
        color: #856404;
    }
    
    .status-cancelled {
        background-color: #f8d7da;
        color: #721c24;
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
