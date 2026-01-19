/**
 * Validation utility functions
 * Follows DRY principles by centralizing validation logic
 */

/**
 * Email validation
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum password length (default: 6)
 * @returns {Object} Validation result with isValid and errors
 */
export const validatePassword = (password, minLength = 6) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters`);
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Username validation
 * @param {string} username - Username to validate
 * @param {number} minLength - Minimum username length (default: 3)
 * @param {number} maxLength - Maximum username length (default: 20)
 * @returns {Object} Validation result with isValid and errors
 */
export const validateUsername = (username, minLength = 3, maxLength = 20) => {
  const errors = [];
  
  if (!username) {
    errors.push('Username is required');
  } else {
    if (username.length < minLength) {
      errors.push(`Username must be at least ${minLength} characters`);
    }
    
    if (username.length > maxLength) {
      errors.push(`Username must be no more than ${maxLength} characters`);
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Phone number validation
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Form validation helper
 * @param {Object} fields - Object with field names and values
 * @param {Object} rules - Validation rules for each field
 * @returns {Object} Validation result with isValid and errors
 */
export const validateForm = (fields, rules) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(rules).forEach(fieldName => {
    const fieldValue = fields[fieldName];
    const fieldRules = rules[fieldName];
    
    if (fieldRules.required && !fieldValue) {
      errors[fieldName] = `${fieldName} is required`;
      isValid = false;
    } else if (fieldValue) {
      // Email validation
      if (fieldRules.email && !isValidEmail(fieldValue)) {
        errors[fieldName] = 'Please enter a valid email address';
        isValid = false;
      }
      
      // Password validation
      if (fieldRules.password) {
        const passwordValidation = validatePassword(fieldValue, fieldRules.minLength);
        if (!passwordValidation.isValid) {
          errors[fieldName] = passwordValidation.errors[0];
          isValid = false;
        }
      }
      
      // Username validation
      if (fieldRules.username) {
        const usernameValidation = validateUsername(fieldValue, fieldRules.minLength, fieldRules.maxLength);
        if (!usernameValidation.isValid) {
          errors[fieldName] = usernameValidation.errors[0];
          isValid = false;
        }
      }
      
      // Phone validation
      if (fieldRules.phone && !isValidPhone(fieldValue)) {
        errors[fieldName] = 'Please enter a valid phone number';
        isValid = false;
      }
      
      // Min length validation
      if (fieldRules.minLength && fieldValue.length < fieldRules.minLength) {
        errors[fieldName] = `${fieldName} must be at least ${fieldRules.minLength} characters`;
        isValid = false;
      }
      
      // Max length validation
      if (fieldRules.maxLength && fieldValue.length > fieldRules.maxLength) {
        errors[fieldName] = `${fieldName} must be no more than ${fieldRules.maxLength} characters`;
        isValid = false;
      }
    }
  });
  
  return {
    isValid,
    errors,
  };
};

/**
 * Login form validation rules
 */
export const LOGIN_VALIDATION_RULES = {
  email: {
    required: true,
    email: true,
  },
  password: {
    required: true,
    minLength: 6,
  },
};

/**
 * Registration form validation rules
 */
export const REGISTRATION_VALIDATION_RULES = {
  username: {
    required: true,
    username: true,
    minLength: 3,
    maxLength: 20,
  },
  email: {
    required: true,
    email: true,
  },
  password: {
    required: true,
    password: true,
    minLength: 8,
  },
  confirmPassword: {
    required: true,
    minLength: 8,
  },
};

