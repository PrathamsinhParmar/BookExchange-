-- BookExchange Database Schema
-- Created for Online Used Book Selling Platform

-- Create database
CREATE DATABASE IF NOT EXISTS bookexchange;
USE bookexchange;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('buyer', 'seller', 'admin') DEFAULT 'buyer',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    profile_image VARCHAR(255),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    country VARCHAR(50) DEFAULT 'USA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- User tokens for remember me functionality
CREATE TABLE user_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Books table
CREATE TABLE books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20),
    category ENUM('fiction', 'non-fiction', 'academic', 'textbook', 'novel', 'biography', 'history', 'science', 'technology', 'business', 'self-help', 'other') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    `condition` ENUM('excellent', 'good', 'fair', 'poor') NOT NULL,
    image_path VARCHAR(255),
    pdf_path VARCHAR(255),
    status ENUM('active', 'sold', 'inactive') DEFAULT 'active',
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seller Book Listings table - Enhanced table for seller book management
CREATE TABLE seller_book_listings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    book_id INT NOT NULL,
    listing_title VARCHAR(255) NOT NULL,
    listing_description TEXT,
    original_price DECIMAL(10,2),
    selling_price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    availability_status ENUM('available', 'reserved', 'sold', 'unavailable') DEFAULT 'available',
    listing_status ENUM('draft', 'active', 'paused', 'expired', 'deleted') DEFAULT 'draft',
    featured BOOLEAN DEFAULT FALSE,
    priority INT DEFAULT 0,
    tags JSON,
    shipping_cost DECIMAL(8,2) DEFAULT 0.00,
    estimated_delivery_days INT DEFAULT 7,
    return_policy TEXT,
    additional_images JSON,
    listing_views INT DEFAULT 0,
    inquiry_count INT DEFAULT 0,
    wishlist_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE KEY unique_seller_book_listing (seller_id, book_id)
);

-- Cart table
CREATE TABLE cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    quantity INT DEFAULT 1,
    status ENUM('active', 'removed', 'purchased') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, book_id, status)
);

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    book_id INT NOT NULL,
    quantity INT DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    shipping_address TEXT NOT NULL,
    billing_address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    order_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (book_id, buyer_id, order_id)
);

-- Wishlist table
CREATE TABLE wishlist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist_item (user_id, book_id)
);

-- Messages table for communication between buyers and sellers
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    book_id INT,
    order_id INT,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Categories table for better organization
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
('Fiction', 'Novels, short stories, and other fictional works'),
('Non-Fiction', 'Biographies, memoirs, and factual books'),
('Academic', 'Textbooks and academic materials'),
('Textbook', 'Educational textbooks for students'),
('Novel', 'Fictional novels and literature'),
('Biography', 'Biographical works and memoirs'),
('History', 'Historical books and accounts'),
('Science', 'Scientific books and research'),
('Technology', 'Technology and computer science books'),
('Business', 'Business and management books'),
('Self-Help', 'Self-improvement and personal development books'),
('Other', 'Books that don\'t fit into other categories');

INSERT INTO users (first_name, last_name, email, phone, password, user_type, status) VALUES
('Admin', 'User', 'admin2@bookexchange.com', '9999999999', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active');


-- Insert sample users
-- Insert sample users
INSERT INTO users (first_name, last_name, email, phone, password, user_type, status) VALUES
('John', 'Doe', 'john.doe1@example.com', '1234567890', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'seller', 'active'),
('Jane', 'Smith', 'jane.smith1@example.com', '1234567891', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'buyer', 'active'),
('Mike', 'Johnson', 'mike.johnson1@example.com', '1234567892', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'seller', 'active');


-- Insert sample books
INSERT INTO books (seller_id, title, author, category, price, description, `condition`, status) VALUES
(2, 'The Great Gatsby', 'F. Scott Fitzgerald', 'fiction', 12.99, 'A classic American novel about the Jazz Age and the American Dream.', 'excellent', 'active'),
(2, 'To Kill a Mockingbird', 'Harper Lee', 'fiction', 15.99, 'A gripping tale of racial injustice and childhood innocence.', 'good', 'active'),
(2, '1984', 'George Orwell', 'fiction', 14.99, 'A dystopian social science fiction novel about totalitarianism.', 'excellent', 'active'),
(4, 'Introduction to Algorithms', 'Thomas H. Cormen', 'academic', 89.99, 'Comprehensive textbook on computer algorithms and data structures.', 'good', 'active'),
(4, 'Clean Code', 'Robert C. Martin', 'technology', 45.99, 'A handbook of agile software craftsmanship.', 'excellent', 'active'),
(2, 'Sapiens', 'Yuval Noah Harari', 'non-fiction', 18.99, 'A brief history of humankind from the Stone Age to the present.', 'good', 'active');

-- Insert sample seller book listings
INSERT INTO seller_book_listings (seller_id, book_id, listing_title, listing_description, original_price, selling_price, discount_percentage, availability_status, listing_status, featured, tags, shipping_cost, estimated_delivery_days, return_policy) VALUES
(2, 1, 'The Great Gatsby - Excellent Condition', 'Classic American literature in pristine condition. Perfect for literature students or collectors.', 19.99, 12.99, 35.02, 'available', 'active', TRUE, '["classic", "literature", "american", "fitzgerald"]', 3.99, 5, '30-day return policy if not satisfied'),
(2, 2, 'To Kill a Mockingbird - Harper Lee', 'Timeless classic about justice and childhood. Good condition with minor wear.', 22.99, 15.99, 30.45, 'available', 'active', FALSE, '["classic", "justice", "childhood", "harper-lee"]', 3.99, 5, '30-day return policy'),
(2, 3, '1984 by George Orwell - Dystopian Classic', 'Essential dystopian novel in excellent condition. No markings or highlights.', 18.99, 14.99, 21.06, 'available', 'active', TRUE, '["dystopian", "orwell", "classic", "political"]', 3.99, 5, '30-day return policy'),
(4, 4, 'Introduction to Algorithms - Computer Science', 'Comprehensive algorithms textbook. Used but in good condition with some highlighting.', 120.00, 89.99, 25.01, 'available', 'active', FALSE, '["algorithms", "computer-science", "textbook", "cormen"]', 5.99, 7, '14-day return policy for academic books'),
(4, 5, 'Clean Code - Software Development', 'Essential book for software developers. Excellent condition, no markings.', 55.99, 45.99, 17.86, 'available', 'active', TRUE, '["programming", "software", "clean-code", "development"]', 3.99, 5, '30-day return policy'),
(2, 6, 'Sapiens - History of Humankind', 'Fascinating history book in good condition. Minor shelf wear.', 24.99, 18.99, 24.01, 'available', 'active', FALSE, '["history", "anthropology", "harari", "non-fiction"]', 3.99, 5, '30-day return policy');


-- Create indexes for better performance
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_price ON books(price);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_seller ON books(seller_id);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_user ON cart(user_id);
CREATE INDEX idx_cart_status ON cart(status);
CREATE INDEX idx_reviews_book ON reviews(book_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);

-- Indexes for seller_book_listings table
CREATE INDEX idx_seller_listings_seller ON seller_book_listings(seller_id);
CREATE INDEX idx_seller_listings_book ON seller_book_listings(book_id);
CREATE INDEX idx_seller_listings_status ON seller_book_listings(listing_status);
CREATE INDEX idx_seller_listings_availability ON seller_book_listings(availability_status);
CREATE INDEX idx_seller_listings_featured ON seller_book_listings(featured);
CREATE INDEX idx_seller_listings_price ON seller_book_listings(selling_price);
CREATE INDEX idx_seller_listings_created ON seller_book_listings(created_at);
CREATE INDEX idx_seller_listings_priority ON seller_book_listings(priority);
