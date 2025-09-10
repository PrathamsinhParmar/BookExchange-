// BookExchange - Seller Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Check if user is a seller
    const userType = localStorage.getItem('user_type');
    if (userType !== 'seller') {
        window.location.href = 'buyer-dashboard.html';
        return;
    }
    
    initSellerDashboard();
    loadSellerStats();
    loadMyBooks();
    loadRecentSales();
    initAddBookModal();
});

// Initialize seller dashboard
function initSellerDashboard() {
    // Update user name
    const userName = localStorage.getItem('user_name');
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    
    // Initialize add book button
    const addBookBtn = document.getElementById('addNewBookBtn');
    const addBookModalBtn = document.getElementById('addBookBtn');
    
    if (addBookBtn) {
        addBookBtn.addEventListener('click', openAddBookModal);
    }
    
    if (addBookModalBtn) {
        addBookModalBtn.addEventListener('click', openAddBookModal);
    }
}

// Load seller statistics
async function loadSellerStats() {
    try {
        // This would typically fetch from a backend endpoint
        // For now, we'll show placeholder data
        const statsData = {
            totalBooks: 12,
            totalSales: 1250.50,
            totalOrders: 8,
            rating: 4.8
        };
        
        updateStatsDisplay(statsData);
    } catch (error) {
        console.error('Error loading seller stats:', error);
    }
}

// Update stats display
function updateStatsDisplay(stats) {
    const totalBooks = document.getElementById('totalBooks');
    const totalSales = document.getElementById('totalSales');
    const totalOrders = document.getElementById('totalOrders');
    const rating = document.getElementById('rating');
    
    if (totalBooks) totalBooks.textContent = stats.totalBooks;
    if (totalSales) totalSales.textContent = `$${stats.totalSales.toFixed(2)}`;
    if (totalOrders) totalOrders.textContent = stats.totalOrders;
    if (rating) rating.textContent = stats.rating.toFixed(1);
}

// Load my books
async function loadMyBooks() {
    try {
        const userId = localStorage.getItem('user_id');
        const response = await fetch(`../backend/fetch-books.php?seller_id=${userId}`);
        const data = await response.json();
        
        if (data.success) {
            displayMyBooks(data.data.books);
        } else {
            console.error('Error loading my books:', data.message);
            showNotification('Error loading your books', 'error');
        }
    } catch (error) {
        console.error('Error loading my books:', error);
        showNotification('Error loading your books', 'error');
    }
}

// Display my books
function displayMyBooks(books) {
    const container = document.getElementById('myBooksGrid');
    if (!container) return;
    
    if (books.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <h3>No books yet</h3>
                <p>Start by adding your first book to sell</p>
                <button class="btn btn-primary" onclick="openAddBookModal()">Add Your First Book</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = books.map(book => `
        <div class="book-card">
            <div class="book-image">
                <img src="${book.image_path || '../assets/images/book-placeholder.jpg'}" alt="${book.title}">
                <div class="book-status status-${book.status}">${book.status}</div>
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">By ${book.author}</p>
                <div class="book-details">
                    <span class="book-category">${book.category}</span>
                    <span class="book-condition">${book.condition}</span>
                </div>
                <div class="book-price">$${book.price}</div>
                <div class="book-actions">
                    <button class="btn btn-sm btn-outline" onclick="editBook(${book.id})">Edit</button>
                    <button class="btn btn-sm btn-secondary" onclick="deleteBook(${book.id})">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load recent sales
async function loadRecentSales() {
    try {
        // This would typically fetch from a backend endpoint
        // For now, we'll show placeholder data
        const salesData = [
            {
                id: 'ORD001',
                book: 'The Great Gatsby',
                buyer: 'John Doe',
                price: '$12.99',
                date: '2024-01-15',
                status: 'Delivered'
            },
            {
                id: 'ORD002',
                book: 'To Kill a Mockingbird',
                buyer: 'Jane Smith',
                price: '$15.99',
                date: '2024-01-20',
                status: 'Shipped'
            }
        ];
        
        displayRecentSales(salesData);
    } catch (error) {
        console.error('Error loading recent sales:', error);
    }
}

// Display recent sales
function displayRecentSales(sales) {
    const tbody = document.getElementById('salesTableBody');
    if (!tbody) return;
    
    if (sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No recent sales</td></tr>';
        return;
    }
    
    tbody.innerHTML = sales.map(sale => `
        <tr>
            <td>${sale.id}</td>
            <td>${sale.book}</td>
            <td>${sale.buyer}</td>
            <td>${sale.price}</td>
            <td>${formatDate(sale.date)}</td>
            <td><span class="status-badge status-${sale.status.toLowerCase()}">${sale.status}</span></td>
        </tr>
    `).join('');
}

// Initialize add book modal
function initAddBookModal() {
    const modal = document.getElementById('addBookModal');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = document.getElementById('cancelAddBook');
    const form = document.getElementById('addBookForm');
    
    // Close modal events
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAddBookModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeAddBookModal);
    }
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeAddBookModal();
        }
    });
    
    // Form submission
    if (form) {
        form.addEventListener('submit', handleAddBook);
    }
}

// Open add book modal
function openAddBookModal() {
    const modal = document.getElementById('addBookModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close add book modal
function closeAddBookModal() {
    const modal = document.getElementById('addBookModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    const form = document.getElementById('addBookForm');
    if (form) {
        form.reset();
    }
}

// Handle add book form submission
async function handleAddBook(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Adding Book...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('../backend/add-book.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Book added successfully!', 'success');
            closeAddBookModal();
            loadMyBooks(); // Refresh the books list
            loadSellerStats(); // Refresh stats
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error adding book:', error);
        showNotification('Error adding book. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Edit book
function editBook(bookId) {
    // This would open an edit modal or redirect to edit page
    showNotification('Edit functionality coming soon!', 'info');
}

// Delete book
async function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }
    
    try {
        // This would call a delete endpoint
        showNotification('Book deleted successfully!', 'success');
        loadMyBooks(); // Refresh the books list
    } catch (error) {
        console.error('Error deleting book:', error);
        showNotification('Error deleting book', 'error');
    }
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

// Add CSS for seller dashboard specific styles
const style = document.createElement('style');
style.textContent = `
    .stats-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
    }
    
    .stat-card {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .stat-icon {
        font-size: 2.5rem;
        color: #2596be;
    }
    
    .stat-content h3 {
        font-size: 2rem;
        font-weight: 700;
        color: #2c3e50;
        margin: 0;
    }
    
    .stat-content p {
        color: #666;
        margin: 0;
        font-size: 0.875rem;
    }
    
    .add-book-section {
        text-align: center;
        margin-bottom: 3rem;
    }
    
    .my-books-section,
    .recent-sales {
        margin-bottom: 3rem;
    }
    
    .book-status {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
    }
    
    .status-active {
        background-color: #d4edda;
        color: #155724;
    }
    
    .status-sold {
        background-color: #cce5ff;
        color: #004085;
    }
    
    .status-inactive {
        background-color: #f8d7da;
        color: #721c24;
    }
    
    .book-details {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    
    .book-category,
    .book-condition {
        background-color: #f8f9fa;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        color: #666;
    }
    
    .book-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }
    
    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
    
    .empty-state h3 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        color: #2c3e50;
    }
    
    .empty-state p {
        color: #666;
        margin-bottom: 2rem;
    }
    
    .modal {
        display: none;
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
    }
    
    .modal-content {
        background-color: white;
        margin: 5% auto;
        padding: 0;
        border-radius: 12px;
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .modal-header {
        padding: 2rem 2rem 1rem;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h2 {
        margin: 0;
        color: #2c3e50;
    }
    
    .close {
        color: #aaa;
        font-size: 2rem;
        font-weight: bold;
        cursor: pointer;
        line-height: 1;
    }
    
    .close:hover {
        color: #000;
    }
    
    .modal-form {
        padding: 2rem;
    }
    
    .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #e9ecef;
    }
    
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
