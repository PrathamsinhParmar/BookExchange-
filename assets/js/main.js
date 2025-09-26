// BookExchange - Main JavaScript File

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initHeroSection();
    initBooksGrid();
    initFAQ();
    initContactForm();
    initSearchAndFilters();
});

// Navigation functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Update cart count
    updateCartCount();
}

// Hero section functionality
function initHeroSection() {
    // Add smooth scrolling to browse books button
    const browseBooksBtn = document.querySelector('.hero-buttons .btn-secondary');
    if (browseBooksBtn) {
        browseBooksBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const featuredBooks = document.querySelector('#featured-books');
            if (featuredBooks) {
                featuredBooks.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// Books grid functionality
function initBooksGrid() {
    const booksGrid = document.getElementById('books-grid');
    if (booksGrid) {
        loadFeaturedBooks();
    }
}

// Load featured books
async function loadFeaturedBooks() {
    try {
        const response = await fetch('../backend/fetch-books.php?limit=6');
        const data = await response.json();
        
        if (data.success) {
            displayBooks(data.data.books, 'books-grid');
        } else {
            console.error('Error loading books:', data.message);
        }
    } catch (error) {
        console.error('Error loading books:', error);
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

// View book details
function viewBookDetails(bookId) {
    window.location.href = `book-details.html?id=${bookId}`;
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

// FAQ functionality
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const toggle = item.querySelector('.faq-toggle');
        
        question.addEventListener('click', () => {
            const isActive = answer.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                const otherAnswer = otherItem.querySelector('.faq-answer');
                const otherToggle = otherItem.querySelector('.faq-toggle');
                otherAnswer.classList.remove('active');
                otherToggle.textContent = '+';
            });
            
            // Toggle current item
            if (!isActive) {
                answer.classList.add('active');
                toggle.textContent = '−';
            } else {
                answer.classList.remove('active');
                toggle.textContent = '+';
            }
        });
    });
}

// Contact form functionality
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
}

// Handle contact form submission
async function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    try {
        // Simulate form submission (replace with actual endpoint)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        e.target.reset();
    } catch (error) {
        showNotification('Error sending message. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Search and filters functionality
function initSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch();
            }, 500);
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', performSearch);
    }
    
    if (priceFilter) {
        priceFilter.addEventListener('change', performSearch);
    }
}

// Perform search
async function performSearch() {
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
    
    try {
        const response = await fetch(`../backend/fetch-books.php?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
            displayBooks(data.data.books, 'books-grid');
        }
    } catch (error) {
        console.error('Error performing search:', error);
    }
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

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
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

// Utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('user_id') !== null;
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Logout functionality
function logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_type');
    window.location.href = 'index.html';
}

// Initialize logout buttons
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtns = document.querySelectorAll('#logoutBtn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
});
