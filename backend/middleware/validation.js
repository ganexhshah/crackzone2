const { body, param, query, validationResult } = require('express-validator');
const DOMPurify = require('isomorphic-dompurify');
const validator = require('validator');

// Custom validation functions
const isStrongPassword = (password) => {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  });
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove HTML tags and dangerous characters
  let sanitized = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  
  // Remove SQL injection patterns
  sanitized = sanitized.replace(/['";\\-]|--|\*\/|\/\*|\|\|/gi, '');
  
  // Remove XSS patterns
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  return sanitized.trim();
};

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn(`Validation failed for ${req.method} ${req.path}:`, errors.array());
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Sanitize all request data
const sanitizeRequestData = (req, res, next) => {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    }
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    for (let key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeInput(req.query[key]);
      }
    }
  }
  
  // Sanitize params
  if (req.params && typeof req.params === 'object') {
    for (let key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = sanitizeInput(req.params[key]);
      }
    }
  }
  
  next();
};

// Validation rules
const validationRules = {
  // User registration
  register: [
    body('username')
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .custom(isStrongPassword)
      .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and symbol'),
    body('fullName')
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Full name must be 2-50 characters and contain only letters and spaces')
  ],

  // User login
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 1 }).withMessage('Password is required')
  ],

  // Tournament creation
  createTournament: [
    body('name')
      .isLength({ min: 3, max: 100 })
      .withMessage('Tournament name must be 3-100 characters'),
    body('description')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be 10-1000 characters'),
    body('maxTeams')
      .isInt({ min: 2, max: 1000 })
      .withMessage('Max teams must be between 2 and 1000'),
    body('entryFee')
      .isFloat({ min: 0, max: 100000 })
      .withMessage('Entry fee must be between 0 and 100000'),
    body('prizePool')
      .isFloat({ min: 0, max: 10000000 })
      .withMessage('Prize pool must be between 0 and 10000000')
  ],

  // Team creation
  createTeam: [
    body('name')
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z0-9\s_-]+$/)
      .withMessage('Team name must be 3-50 characters and contain only letters, numbers, spaces, underscores, and hyphens'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters')
  ],

  // Profile update
  updateProfile: [
    body('fullName')
      .optional()
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Full name must be 2-50 characters and contain only letters and spaces'),
    body('phoneNumber')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),
    body('gameUid')
      .optional()
      .isLength({ min: 3, max: 20 })
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage('Game UID must be 3-20 characters and contain only letters and numbers')
  ],

  // Wallet operations
  walletOperation: [
    body('amount')
      .isFloat({ min: 1, max: 100000 })
      .withMessage('Amount must be between 1 and 100000'),
    body('description')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Description must be less than 200 characters')
  ],

  // Admin operations
  adminLogin: [
    body('username')
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Invalid username format'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],

  // File upload validation
  fileUpload: [
    body('fileType')
      .optional()
      .isIn(['image/jpeg', 'image/png', 'image/webp'])
      .withMessage('Only JPEG, PNG, and WebP images are allowed'),
    body('fileSize')
      .optional()
      .isInt({ max: 5242880 }) // 5MB
      .withMessage('File size must be less than 5MB')
  ],

  // Search validation
  search: [
    query('q')
      .isLength({ min: 1, max: 100 })
      .matches(/^[a-zA-Z0-9\s_-]+$/)
      .withMessage('Search query must be 1-100 characters and contain only letters, numbers, spaces, underscores, and hyphens'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],

  // ID parameter validation
  validateId: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer')
  ],

  // Pagination validation
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Page must be between 1 and 1000'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ]
};

// File validation middleware
const validateFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  const file = req.file || (req.files && req.files[0]);
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' });
  }

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
  }

  // Check for malicious file content
  const buffer = file.buffer || Buffer.from('');
  const fileHeader = buffer.toString('hex', 0, 4);
  
  const validHeaders = {
    'ffd8ffe0': 'jpeg',
    'ffd8ffe1': 'jpeg',
    'ffd8ffe2': 'jpeg',
    '89504e47': 'png',
    '52494646': 'webp'
  };

  if (!validHeaders[fileHeader]) {
    return res.status(400).json({ error: 'Invalid file format or corrupted file.' });
  }

  next();
};

module.exports = {
  validationRules,
  handleValidationErrors,
  sanitizeRequestData,
  validateFileUpload,
  sanitizeInput
};