// BookExchange - Book Details JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    initBookDetails();
    loadBookDetails();
    loadReviews();
});

// Initialize book details page
function initBookDetails() {
    // Initialize action buttons
    const addToCartBtn = document.getElementById('addToCartBtn');
    const buyNowBtn = document.getElementById('buyNowBtn');
    const wishlistBtn = document.getElementById('wishlistBtn');
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', handleAddToCart);
    }
    
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', handleBuyNow);
    }
    
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', handleWishlist);
    }
}

// Load book details
async function loadBookDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    if (!bookId) {
        showNotification('Book not found', 'error');
        window.location.href = 'buyer-dashboard.html';
        return;
    }
    
    try {
        const response = await fetch(`../backend/fetch-books.php?id=${bookId}`);
        const data = await response.json();
        
        if (data.success && data.data.books.length > 0) {
            const book = data.data.books[0];
            displayBookDetails(book);
        } else {
            showNotification('Book not found', 'error');
            window.location.href = 'buyer-dashboard.html';
        }
    } catch (error) {
        console.error('Error loading book details:', error);
        showNotification('Error loading book details', 'error');
    }
}

// Display book details
function displayBookDetails(book) {
    // Update page title
    document.title = `${book.title} - BookExchange`;
    
    // Update book image
    const bookImage = document.getElementById('bookImage');
    if (bookImage) {
        bookImage.src = book.image_path || '../assets/images/book-placeholder.jpg';
        bookImage.alt = book.title;
    }
    
    // Update book title
    const bookTitle = document.getElementById('bookTitle');
    if (bookTitle) {
        bookTitle.textContent = book.title;
    }
    
    // Update book author
    const bookAuthor = document.getElementById('bookAuthor');
    if (bookAuthor) {
        bookAuthor.textContent = `By ${book.author}`;
    }
    
    // Update book price
    const bookPrice = document.getElementById('bookPrice');
    if (bookPrice) {
        bookPrice.textContent = `$${book.price}`;
    }
    
    // Update book category
    const bookCategory = document.getElementById('bookCategory');
    if (bookCategory) {
        bookCategory.textContent = book.category;
    }
    
    // Update book condition
    const bookCondition = document.getElementById('bookCondition');
    if (bookCondition) {
        bookCondition.textContent = book.condition;
    }
    
    // Update seller name
    const sellerName = document.getElementById('sellerName');
    if (sellerName) {
        sellerName.textContent = book.seller_name;
    }
    
    // Update book description
    const bookDescription = document.getElementById('bookDescription');
    if (bookDescription) {
        bookDescription.textContent = book.description;
    }
    
    // Update rating
    const rating = book.avg_rating || 0;
    const stars = document.querySelector('.stars');
    if (stars) {
        stars.textContent = generateStars(rating);
    }
    
    const ratingText = document.querySelector('.rating-text');
    if (ratingText) {
        ratingText.textContent = `(${rating}) - ${book.review_count} reviews`;
    }
    
    // Store book ID for actions
    window.currentBookId = book.id;
    window.currentBook = book;
}

// Load reviews
async function loadReviews() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    if (!bookId) return;
    
    try {
        // This would typically fetch from a backend endpoint
        // For now, we'll show placeholder data
        const reviewsData = [
            {
                id: 1,
                user: 'John Doe',
                rating: 5,
                title: 'Great book!',
                comment: 'Really enjoyed reading this book. Highly recommended!',
                date: '2024-01-15'
            },
            {
                id: 2,
                user: 'Jane Smith',
                rating: 4,
                title: 'Good read',
                comment: 'Good book with interesting plot. Would recommend.',
                date: '2024-01-10'
            }
        ];
        
        displayReviews(reviewsData);
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// Display reviews
function displayReviews(reviews) {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    
    if (reviews.length === 0) {
        container.innerHTML = '<p class="text-center">No reviews yet.</p>';
        return;
    }
    
    container.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="review-user">
                    <h4>${review.user}</h4>
                    <div class="review-rating">
                        <span class="stars">${generateStars(review.rating)}</span>
                        <span class="review-date">${formatDate(review.date)}</span>
                    </div>
                </div>
            </div>
            <div class="review-content">
                <h5>${review.title}</h5>
                <p>${review.comment}</p>
            </div>
        </div>
    `).join('');
}

// Handle add to cart
async function handleAddToCart() {
    if (!window.currentBookId) {
        showNotification('Book not found', 'error');
        return;
    }
    
    try {
        const response = await fetch('../backend/cart.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=add&book_id=${window.currentBookId}`
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

// Handle buy now
function handleBuyNow() {
    if (!window.currentBookId) {
        showNotification('Book not found', 'error');
        return;
    }
    
    // Add to cart first, then redirect to checkout
    handleAddToCart().then(() => {
        window.location.href = 'cart.html';
    });
}

// Handle wishlist
function handleWishlist() {
    if (!window.currentBookId) {
        showNotification('Book not found', 'error');
        return;
    }
    
    // This would typically add to wishlist
    showNotification('Added to wishlist!', 'success');
    
    // Update button text
    const wishlistBtn = document.getElementById('wishlistBtn');
    if (wishlistBtn) {
        wishlistBtn.textContent = '♥ In Wishlist';
        wishlistBtn.style.color = '#dc3545';
    }
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
        month: 'long',
        day: 'numeric'
    });
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

// Add CSS for book details specific styles
const style = document.createElement('style');
style.textContent = `
    .book-details {
        padding: 80px 0;
        background-color: white;
    }
    
    .book-details-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4rem;
        margin-bottom: 4rem;
    }
    
    .book-image {
        text-align: center;
    }
    
    .book-image img {
        max-width: 100%;
        height: auto;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    
    .book-info h1 {
        font-size: 2.5rem;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 0.5rem;
    }
    
    .book-author {
        font-size: 1.25rem;
        color: #666;
        margin-bottom: 1rem;
    }
    
    .book-rating {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }
    
    .stars {
        color: #ffc107;
        font-size: 1.25rem;
    }
    
    .rating-text {
        color: #666;
        font-size: 0.875rem;
    }
    
    .book-price {
        margin-bottom: 2rem;
    }
    
    .current-price {
        font-size: 2rem;
        font-weight: 700;
        color: #2596be;
    }
    
    .original-price {
        font-size: 1.25rem;
        color: #999;
        text-decoration: line-through;
        margin-left: 1rem;
    }
    
    .discount {
        background-color: #dc3545;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 500;
        margin-left: 1rem;
    }
    
    .book-details-list {
        margin-bottom: 2rem;
    }
    
    .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 0;
        border-bottom: 1px solid #e9ecef;
    }
    
    .detail-label {
        font-weight: 500;
        color: #2c3e50;
    }
    
    .detail-value {
        color: #666;
    }
    
    .book-description {
        margin-bottom: 2rem;
    }
    
    .book-description h3 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 1rem;
    }
    
    .book-description p {
        line-height: 1.6;
        color: #666;
    }
    
    .book-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    .book-actions .btn {
        flex: 1;
        min-width: 150px;
    }
    
    .seller-info {
        background: #f8f9fa;
        padding: 2rem;
        border-radius: 12px;
        margin-bottom: 3rem;
    }
    
    .seller-info h3 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 1.5rem;
    }
    
    .seller-card {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .seller-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        overflow: hidden;
    }
    
    .seller-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .seller-details h4 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 0.5rem;
    }
    
    .seller-rating {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }
    
    .seller-rating .stars {
        color: #ffc107;
    }
    
    .seller-details p {
        color: #666;
        margin-bottom: 1rem;
    }
    
    .reviews-section {
        margin-bottom: 3rem;
    }
    
    .reviews-section h3 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 2rem;
    }
    
    .reviews-summary {
        background: #f8f9fa;
        padding: 2rem;
        border-radius: 12px;
        margin-bottom: 2rem;
    }
    
    .rating-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .rating-item {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .rating-item span:first-child {
        min-width: 30px;
        font-weight: 500;
    }
    
    .rating-bar {
        flex: 1;
        height: 8px;
        background-color: #e9ecef;
        border-radius: 4px;
        overflow: hidden;
    }
    
    .rating-fill {
        height: 100%;
        background-color: #ffc107;
        transition: width 0.3s ease;
    }
    
    .rating-item span:last-child {
        min-width: 30px;
        text-align: right;
        font-size: 0.875rem;
        color: #666;
    }
    
    .reviews-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .review-item {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .review-header {
        margin-bottom: 1rem;
    }
    
    .review-user h4 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 0.25rem;
    }
    
    .review-rating {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .review-rating .stars {
        color: #ffc107;
    }
    
    .review-date {
        color: #666;
        font-size: 0.875rem;
    }
    
    .review-content h5 {
        font-size: 1rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 0.5rem;
    }
    
    .review-content p {
        color: #666;
        line-height: 1.6;
    }
    
    @media (max-width: 768px) {
        .book-details-content {
            grid-template-columns: 1fr;
        }
        
        .book-actions {
            flex-direction: column;
        }
        
        .book-actions .btn {
            flex: none;
        }
        
        .seller-card {
            flex-direction: column;
            text-align: center;
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
