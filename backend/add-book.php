<?php
require_once 'db.php';

// Check authentication
$userId = checkAuth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $isbn = sanitizeInput($_POST['book_id']);
    $title = sanitizeInput($_POST['title']);
    $author = sanitizeInput($_POST['author']);
    $category = sanitizeInput($_POST['category']);
    $price = floatval($_POST['price']);
    $description = sanitizeInput($_POST['description']);
    $condition = sanitizeInput($_POST['condition']);
    
    // Validate input
    if (empty($title) || empty($author) || empty($category) || empty($price) || empty($description) || empty($condition)) {
        sendResponse(false, 'Please fill in all fields');
    }
    
    if ($price <= 0) {
        sendResponse(false, 'Price must be greater than 0');
    }
    
    $allowedCategories = ['fiction', 'non-fiction', 'academic', 'textbook', 'novel'];
    if (!in_array($category, $allowedCategories)) {
        sendResponse(false, 'Invalid category selected');
    }
    
    $allowedConditions = ['excellent', 'good', 'fair', 'poor'];
    if (!in_array($condition, $allowedConditions)) {
        sendResponse(false, 'Invalid condition selected');
    }
    
    try {
        // Handle file upload
        $imagePath = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imagePath = uploadFile($_FILES['image']);
            if (!$imagePath) {
                sendResponse(false, 'Failed to upload image. Please try again.');
            }
        } else {-
            sendResponse(false, 'Please upload a book cover image');
        }
        
        // Insert book into database
        $stmt = $pdo->prepare("
            INSERT INTO books (seller_id, isbn, title, author, category, price, description, `condition`, image_path, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
        ");
        
        $result = $stmt->execute([$userId, $isbn, $title, $author, $category, $price, $description, $condition, $imagePath]);
        
        if ($result) {
            $bookId = $pdo->lastInsertId();
            sendResponse(true, 'Book added successfully', ['book_id' => $bookId]);
        } else {
            sendResponse(false, 'Failed to add book. Please try again.');
        }
        
    } catch (PDOException $e) {
        sendResponse(false, 'Database error: ' . $e->getMessage());
    }
} else {
    sendResponse(false, 'Invalid request method');
}
?>
