// BookExchange - Contact JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
    initFAQ();
});

// Initialize contact form
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
    
    // Validate form
    if (!validateContactForm(e.target)) {
        return;
    }
    
    // Show loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    try {
        // Simulate form submission (replace with actual endpoint)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        e.target.reset();
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Error sending message. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Validate contact form
function validateContactForm(form) {
    const firstName = form.querySelector('#firstName');
    const lastName = form.querySelector('#lastName');
    const email = form.querySelector('#email');
    const subject = form.querySelector('#subject');
    const message = form.querySelector('#message');
    
    let isValid = true;
    
    // Clear previous errors
    clearFieldError(firstName);
    clearFieldError(lastName);
    clearFieldError(email);
    clearFieldError(subject);
    clearFieldError(message);
    
    // Validate first name
    if (!firstName.value.trim()) {
        showFieldError(firstName, 'First name is required');
        isValid = false;
    }
    
    // Validate last name
    if (!lastName.value.trim()) {
        showFieldError(lastName, 'Last name is required');
        isValid = false;
    }
    
    // Validate email
    if (!email.value.trim()) {
        showFieldError(email, 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email.value)) {
        showFieldError(email, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate subject
    if (!subject.value.trim()) {
        showFieldError(subject, 'Subject is required');
        isValid = false;
    }
    
    // Validate message
    if (!message.value.trim()) {
        showFieldError(message, 'Message is required');
        isValid = false;
    } else if (message.value.trim().length < 10) {
        showFieldError(message, 'Message must be at least 10 characters long');
        isValid = false;
    }
    
    return isValid;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

// Initialize FAQ functionality
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

// Add CSS for contact page specific styles
const style = document.createElement('style');
style.textContent = `
    .field-error {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
    
    .form-group input.error,
    .form-group textarea.error {
        border-color: #dc3545;
    }
    
    .form-group input:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #2596be;
        box-shadow: 0 0 0 2px rgba(37, 150, 190, 0.2);
    }
    
    .faq-item {
        background: white;
        border-radius: 12px;
        margin-bottom: 1rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: box-shadow 0.3s ease;
    }
    
    .faq-item:hover {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    
    .faq-question {
        padding: 1.5rem;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background-color 0.3s ease;
        user-select: none;
    }
    
    .faq-question:hover {
        background-color: #f8f9fa;
    }
    
    .faq-question h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #2c3e50;
        margin: 0;
    }
    
    .faq-toggle {
        font-size: 1.5rem;
        color: #2596be;
        font-weight: bold;
        transition: transform 0.3s ease;
    }
    
    .faq-answer {
        padding: 0 1.5rem 1.5rem;
        color: #666;
        line-height: 1.6;
        display: none;
        animation: fadeIn 0.3s ease;
    }
    
    .faq-answer.active {
        display: block;
    }
    
    .contact-method {
        transition: transform 0.3s ease;
    }
    
    .contact-method:hover {
        transform: translateY(-2px);
    }
    
    .contact-form-container {
        transition: box-shadow 0.3s ease;
    }
    
    .contact-form-container:hover {
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
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
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
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
    
    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(style);
