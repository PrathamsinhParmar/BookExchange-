<?php
require_once 'db.php';

// Get parameters
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 12;
$search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : '';
$category = isset($_GET['category']) ? sanitizeInput($_GET['category']) : '';
$priceMin = isset($_GET['price_min']) ? floatval($_GET['price_min']) : 0;
$priceMax = isset($_GET['price_max']) ? floatval($_GET['price_max']) : 999999;
$sellerId = isset($_GET['seller_id']) ? intval($_GET['seller_id']) : null;

$offset = ($page - 1) * $limit;

try {
    // Build query
    $whereConditions = ["b.status = 'active'"];
    $params = [];
    
    if (!empty($search)) {
        $whereConditions[] = "(b.title LIKE ? OR b.author LIKE ? OR b.description LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    if (!empty($category)) {
        $whereConditions[] = "b.category = ?";
        $params[] = $category;
    }
    
    if ($priceMin > 0) {
        $whereConditions[] = "b.price >= ?";
        $params[] = $priceMin;
    }
    
    if ($priceMax < 999999) {
        $whereConditions[] = "b.price <= ?";
        $params[] = $priceMax;
    }
    
    if ($sellerId) {
        $whereConditions[] = "b.seller_id = ?";
        $params[] = $sellerId;
    }
    
    $whereClause = implode(' AND ', $whereConditions);
    
    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM books b WHERE $whereClause";
    $countStmt = $pdo->prepare($countQuery);
    $countStmt->execute($params);
    $totalBooks = $countStmt->fetch()['total'];
    
    // Get books
    $query = "
        SELECT 
            b.*,
            u.first_name,
            u.last_name,
            u.email as seller_email,
            AVG(r.rating) as avg_rating,
            COUNT(r.id) as review_count
        FROM books b
        LEFT JOIN users u ON b.seller_id = u.id
        LEFT JOIN reviews r ON b.id = r.book_id
        WHERE $whereClause
        GROUP BY b.id
        ORDER BY b.created_at DESC
        LIMIT $limit OFFSET $offset
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $books = $stmt->fetchAll();
    
    // Format books data
    $formattedBooks = [];
    foreach ($books as $book) {
        $formattedBooks[] = [
            'id' => $book['id'],
            'title' => $book['title'],
            'author' => $book['author'],
            'category' => $book['category'],
            'price' => number_format($book['price'], 2),
            'description' => $book['description'],
            'condition' => $book['condition'],
            'image_path' => $book['image_path'],
            'seller_name' => $book['first_name'] . ' ' . $book['last_name'],
            'seller_email' => $book['seller_email'],
            'avg_rating' => $book['avg_rating'] ? number_format($book['avg_rating'], 1) : '0.0',
            'review_count' => $book['review_count'],
            'created_at' => $book['created_at']
        ];
    }
    
    $totalPages = ceil($totalBooks / $limit);
    
    sendResponse(true, 'Books fetched successfully', [
        'books' => $formattedBooks,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $totalPages,
            'total_books' => $totalBooks,
            'limit' => $limit
        ]
    ]);
    
} catch (PDOException $e) {
    sendResponse(false, 'Database error: ' . $e->getMessage());
}
?>
