<?php
// Database configuration
$host = '127.0.0.1';
$dbname = 'bookexchange';
$username = 'root';
$password = '';

try {
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// Function to sanitize input
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Function to generate response
function sendResponse($success, $message, $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Function to validate email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Function to hash password
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Function to verify password
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Function to generate random token
function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

// Function to check if user is logged in
function checkAuth() {
    session_start();
    if (!isset($_SESSION['user_id'])) {
        sendResponse(false, 'Authentication required');
    }
    return $_SESSION['user_id'];
}

// Function to upload file
function uploadFile($file, $uploadDir = '../assets/uploads/') {
    $targetDir = $uploadDir;
    $fileName = basename($file['name']);
    $targetFile = $targetDir . uniqid() . '_' . $fileName;
    $fileType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
    
    // Check if file is an image
    $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
    if (!in_array($fileType, $allowedTypes)) {
        return false;
    }
    
    // Check file size (5MB max)
    if ($file['size'] > 5000000) {
        return false;
    }
    
    if (move_uploaded_file($file['tmp_name'], $targetFile)) {
        return $targetFile;
    }
    
    return false;
}
?>
