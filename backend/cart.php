<?php
require_once 'db.php';

// Check authentication
$userId = checkAuth();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get cart items
    try {
        $stmt = $pdo->prepare("
            SELECT 
                c.*,
                b.title,
                b.author,
                b.price,
                b.image_path,
                b.`condition`,
                u.first_name,
                u.last_name
            FROM cart c
            JOIN books b ON c.book_id = b.id
            JOIN users u ON b.seller_id = u.id
            WHERE c.user_id = ? AND c.status = 'active'
        ");
        $stmt->execute([$userId]);
        $cartItems = $stmt->fetchAll();
        
        sendResponse(true, 'Cart items fetched successfully', $cartItems);
        
    } catch (PDOException $e) {
        sendResponse(false, 'Database error: ' . $e->getMessage());
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'];
    $bookId = intval($_POST['book_id']);
    
    try {
        if ($action === 'add') {
            // Check if book exists and is available
            $stmt = $pdo->prepare("SELECT id, seller_id FROM books WHERE id = ? AND status = 'active'");
            $stmt->execute([$bookId]);
            $book = $stmt->fetch();
            
            if (!$book) {
                sendResponse(false, 'Book not found or not available');
            }
            
            // Check if user is trying to buy their own book
            if ($book['seller_id'] == $userId) {
                sendResponse(false, 'You cannot add your own book to cart');
            }
            
            // Check if book is already in cart
            $stmt = $pdo->prepare("SELECT id FROM cart WHERE user_id = ? AND book_id = ? AND status = 'active'");
            $stmt->execute([$userId, $bookId]);
            if ($stmt->fetch()) {
                sendResponse(false, 'Book already in cart');
            }
            
            // Add to cart
            $stmt = $pdo->prepare("INSERT INTO cart (user_id, book_id, created_at) VALUES (?, ?, NOW())");
            $result = $stmt->execute([$userId, $bookId]);
            
            if ($result) {
                sendResponse(true, 'Book added to cart successfully');
            } else {
                sendResponse(false, 'Failed to add book to cart');
            }
            
        } elseif ($action === 'remove') {
            // Remove from cart
            $stmt = $pdo->prepare("UPDATE cart SET status = 'removed' WHERE user_id = ? AND book_id = ? AND status = 'active'");
            $result = $stmt->execute([$userId, $bookId]);
            
            if ($result) {
                sendResponse(true, 'Book removed from cart successfully');
            } else {
                sendResponse(false, 'Failed to remove book from cart');
            }
            
        } elseif ($action === 'update_quantity') {
            $quantity = intval($_POST['quantity']);
            
            if ($quantity <= 0) {
                sendResponse(false, 'Quantity must be greater than 0');
            }
            
            // Update quantity
            $stmt = $pdo->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND book_id = ? AND status = 'active'");
            $result = $stmt->execute([$quantity, $userId, $bookId]);
            
            if ($result) {
                sendResponse(true, 'Cart updated successfully');
            } else {
                sendResponse(false, 'Failed to update cart');
            }
            
        } else {
            sendResponse(false, 'Invalid action');
        }
        
    } catch (PDOException $e) {
        sendResponse(false, 'Database error: ' . $e->getMessage());
    }
    
} else {
    sendResponse(false, 'Invalid request method');
}
?>
