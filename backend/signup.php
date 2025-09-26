<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $firstName = sanitizeInput($_POST['firstName']);
    $lastName = sanitizeInput($_POST['lastName']);
    $email = sanitizeInput($_POST['email']);
    $phone = sanitizeInput($_POST['phone']);
    $password = $_POST['password'];
    $confirmPassword = $_POST['confirmPassword'];
    $accountType = sanitizeInput($_POST['accountType']);
    $terms = isset($_POST['terms']) ? true : false;
    
    // Validate input
    if (empty($firstName) || empty($lastName) || empty($email) || empty($phone) || empty($password) || empty($confirmPassword) || empty($accountType)) {
        sendResponse(false, 'Please fill in all fields');
    }
    
    // Validate account type
    if (!in_array($accountType, ['buyer', 'seller'])) {
        sendResponse(false, 'Invalid account type selected');
    }
    
    if (!validateEmail($email)) {
        sendResponse(false, 'Please enter a valid email address');
    }
    
    if (strlen($password) < 8) {
        sendResponse(false, 'Password must be at least 8 characters long');
    }
    
    if ($password !== $confirmPassword) {
        sendResponse(false, 'Passwords do not match');
    }
    
    if (!$terms) {
        sendResponse(false, 'Please accept the terms and conditions');
    }
    
    // Validate phone number (basic validation)
    if (!preg_match('/^[0-9+\-\s()]+$/', $phone)) {
        sendResponse(false, 'Please enter a valid phone number');
    }
    
    try {
        // Check if email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            sendResponse(false, 'Email address already registered');
        }
        
        // Hash password
        $hashedPassword = hashPassword($password);
        
        // Insert new user
        $stmt = $pdo->prepare("
            INSERT INTO users (first_name, last_name, email, phone, password, user_type, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())
        ");
        
        $result = $stmt->execute([$firstName, $lastName, $email, $phone, $hashedPassword, $accountType]);
        
        if ($result) {
            $userId = $pdo->lastInsertId();
            
            // Start session
            session_start();
            $_SESSION['user_id'] = $userId;
            $_SESSION['user_email'] = $email;
            $_SESSION['user_name'] = $firstName . ' ' . $lastName;
            $_SESSION['user_type'] = $accountType;
            
            sendResponse(true, 'Account created successfully', [
                'user_id' => $userId,
                'name' => $firstName . ' ' . $lastName,
                'email' => $email,
                'user_type' => $accountType
            ]);
        } else {
            sendResponse(false, 'Failed to create account. Please try again.');
        }
        
    } catch (PDOException $e) {
        sendResponse(false, 'Database error: ' . $e->getMessage());
    }
} else {
    sendResponse(false, 'Invalid request method');
}
?>
