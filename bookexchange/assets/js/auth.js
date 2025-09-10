// BookExchange - Authentication JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initAuthForms();
    checkAuthStatus();
});

// Initialize authentication forms
function initAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Signing In...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('../backend/login.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store user data in localStorage
            localStorage.setItem('user_id', data.data.user_id);
            localStorage.setItem('user_name', data.data.name);
            localStorage.setItem('user_email', data.data.email);
            localStorage.setItem('user_type', data.data.user_type);
            
            showNotification('Login successful!', 'success');
            
            // Redirect based on user type
            setTimeout(() => {
                if (data.data.user_type === 'seller') {
                    window.location.href = 'seller-dashboard.html';
                } else {
                    window.location.href = 'buyer-dashboard.html';
                }
            }, 1000);
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Handle signup form submission
async function handleSignup(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Validate passwords match
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('../backend/signup.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store user data in localStorage
            localStorage.setItem('user_id', data.data.user_id);
            localStorage.setItem('user_name', data.data.name);
            localStorage.setItem('user_email', data.data.email);
            localStorage.setItem('user_type', data.data.user_type);
            
            showNotification('Account created successfully!', 'success');
            
            // Redirect to appropriate dashboard
            setTimeout(() => {
                window.location.href = 'buyer-dashboard.html';
            }, 1000);
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('Account creation failed. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Check authentication status
function checkAuthStatus() {
    const user_id = localStorage.getItem('user_id');
    const user_name = localStorage.getItem('user_name');
    const user_type = localStorage.getItem('user_type');
    
    if (user_id) {
        // Update user name display
        const userNameElements = document.querySelectorAll('#userName');
        userNameElements.forEach(element => {
            element.textContent = user_name;
        });
        
        // Show/hide elements based on auth status
        const authElements = document.querySelectorAll('.auth-only');
        authElements.forEach(element => {
            element.style.display = 'block';
        });
        
        const guestElements = document.querySelectorAll('.guest-only');
        guestElements.forEach(element => {
            element.style.display = 'none';
        });
        
        // Update navigation based on user type
        updateNavigationForUser(user_type);
    } else {
        // User not logged in
        const authElements = document.querySelectorAll('.auth-only');
        authElements.forEach(element => {
            element.style.display = 'none';
        });
        
        const guestElements = document.querySelectorAll('.guest-only');
        guestElements.forEach(element => {
            element.style.display = 'block';
        });
    }
}

// Update navigation based on user type
function updateNavigationForUser(userType) {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    
    // Remove existing auth links
    const existingAuthLinks = navMenu.querySelectorAll('.auth-link');
    existingAuthLinks.forEach(link => link.remove());
    
    // Add appropriate links based on user type
    if (userType === 'seller') {
        addNavLink(navMenu, 'Seller Dashboard', 'seller-dashboard.html');
        addNavLink(navMenu, 'Add Book', '#', 'addBookBtn');
    } else if (userType === 'buyer') {
        addNavLink(navMenu, 'Buyer Dashboard', 'buyer-dashboard.html');
        addNavLink(navMenu, 'Cart', 'cart.html', null, 'cart-count');
    }
    
    addNavLink(navMenu, 'Logout', '#', 'logoutBtn');
}

// Add navigation link
function addNavLink(container, text, href, id, extraClass) {
    const li = document.createElement('li');
    li.className = 'nav-item auth-link';
    
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    a.className = 'nav-link';
    
    if (id) {
        a.id = id;
    }
    
    if (extraClass) {
        const span = document.createElement('span');
        span.className = extraClass;
        span.textContent = '0';
        a.appendChild(span);
    }
    
    li.appendChild(a);
    container.appendChild(li);
}

// Password strength checker
function checkPasswordStrength(password) {
    const strength = {
        score: 0,
        feedback: []
    };
    
    if (password.length >= 8) strength.score += 1;
    else strength.feedback.push('At least 8 characters');
    
    if (/[a-z]/.test(password)) strength.score += 1;
    else strength.feedback.push('Lowercase letter');
    
    if (/[A-Z]/.test(password)) strength.score += 1;
    else strength.feedback.push('Uppercase letter');
    
    if (/[0-9]/.test(password)) strength.score += 1;
    else strength.feedback.push('Number');
    
    if (/[^A-Za-z0-9]/.test(password)) strength.score += 1;
    else strength.feedback.push('Special character');
    
    return strength;
}

// Initialize password strength indicator
function initPasswordStrength() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    passwordInputs.forEach(input => {
        if (input.name === 'password') {
            input.addEventListener('input', function() {
                const strength = checkPasswordStrength(this.value);
                updatePasswordStrengthIndicator(this, strength);
            });
        }
    });
}

// Update password strength indicator
function updatePasswordStrengthIndicator(input, strength) {
    let indicator = input.parentNode.querySelector('.password-strength');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'password-strength';
        input.parentNode.appendChild(indicator);
    }
    
    const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['#dc3545', '#fd7e14', '#ffc107', '#20c997', '#28a745'];
    
    indicator.innerHTML = `
        <div class="strength-bar">
            <div class="strength-fill" style="width: ${(strength.score / 5) * 100}%; background-color: ${strengthColors[strength.score] || '#dc3545'}"></div>
        </div>
        <div class="strength-text">
            ${strength.score > 0 ? strengthLevels[strength.score - 1] : 'Enter password'}
            ${strength.feedback.length > 0 ? `<br><small>Missing: ${strength.feedback.join(', ')}</small>` : ''}
        </div>
    `;
}

// Form validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            showFieldError(input, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(input);
        }
        
        // Email validation
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                showFieldError(input, 'Please enter a valid email address');
                isValid = false;
            }
        }
        
        // Phone validation
        if (input.type === 'tel' && input.value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(input.value.replace(/[\s\-\(\)]/g, ''))) {
                showFieldError(input, 'Please enter a valid phone number');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Show field error
function showFieldError(input, message) {
    clearFieldError(input);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'color: #dc3545; font-size: 0.875rem; margin-top: 0.25rem;';
    
    input.parentNode.appendChild(errorDiv);
    input.style.borderColor = '#dc3545';
}

// Clear field error
function clearFieldError(input) {
    const existingError = input.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    input.style.borderColor = '#e9ecef';
}

// Initialize form validation
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    showFieldError(this, 'This field is required');
                } else {
                    clearFieldError(this);
                }
            });
        });
    });
}

// Initialize all auth functionality
document.addEventListener('DOMContentLoaded', function() {
    initPasswordStrength();
    initFormValidation();
});

// Show notification function (reuse from main.js)
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
