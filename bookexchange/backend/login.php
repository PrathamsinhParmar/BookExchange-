<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = sanitizeInput($_POST['email']);
    $password = $_POST['password'];
    $remember = isset($_POST['remember']) ? true : false;
    
    // Validate input
    if (empty($email) || empty($password)) {
        sendResponse(false, 'Please fill in all fields');
    }
    
    if (!validateEmail($email)) {
        sendResponse(false, 'Please enter a valid email address');
    }
    
    try {
        // Check if user exists
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user) {
            sendResponse(false, 'Invalid email or password');
        }
        
        // Verify password
        if (!verifyPassword($password, $user['password'])) {
            sendResponse(false, 'Invalid email or password');
        }
        
        // Check if user is active
        if ($user['status'] !== 'active') {
            sendResponse(false, 'Your account has been deactivated. Please contact support.');
        }
        
        // Start session
        session_start();
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
        $_SESSION['user_type'] = $user['user_type'];
        
        // Update last login
        $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        // Set remember me cookie if requested
        if ($remember) {
            $token = generateToken();
            $expiry = time() + (30 * 24 * 60 * 60); // 30 days
            
            // Store token in database
            $stmt = $pdo->prepare("INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)");
            $stmt->execute([$user['id'], $token, date('Y-m-d H:i:s', $expiry)]);
            
            setcookie('remember_token', $token, $expiry, '/', '', false, true);
        }
        
        sendResponse(true, 'Login successful', [
            'user_id' => $user['id'],
            'name' => $user['first_name'] . ' ' . $user['last_name'],
            'email' => $user['email'],
            'user_type' => $user['user_type']
        ]);
        
    } catch (PDOException $e) {
        sendResponse(false, 'Database error: ' . $e->getMessage());
    }
} else {
    sendResponse(false, 'Invalid request method');
}
?>
