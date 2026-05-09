/**
 * Validation helper utilities
 */

const { validationResult } = require('express-validator');

/**
 * Handle validation errors from express-validator
 * @param {Object} req - Express request object
 * @returns {Array} Array of validation errors
 */
const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
  }
  return [];
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ObjectId string
 * @returns {boolean} True if valid ObjectId
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Sanitize filename for storage
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9\-_\.]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Validate file extension
 * @param {string} filename - Filename to validate
 * @param {Array} allowedExtensions - Array of allowed extensions
 * @returns {boolean} True if extension is allowed
 */
const isAllowedExtension = (filename, allowedExtensions) => {
  const ext = filename.split('.').pop().toLowerCase();
  return allowedExtensions.includes(ext);
};

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @param {number} maxSize - Maximum allowed size in bytes
 * @returns {boolean} True if size is within limit
 */
const isValidFileSize = (size, maxSize) => {
  return size <= maxSize;
};

/**
 * Common file extensions for code files
 */
const CODE_FILE_EXTENSIONS = [
  'js', 'jsx', 'ts', 'tsx', 'vue', 'svelte',
  'html', 'htm', 'css', 'scss', 'sass', 'less',
  'json', 'xml', 'yaml', 'yml', 'toml', 'ini',
  'py', 'pyx', 'pyi', 'ipynb',
  'java', 'kt', 'scala', 'groovy',
  'c', 'cpp', 'cc', 'cxx', 'h', 'hpp', 'hxx',
  'cs', 'vb', 'fs', 'fsx',
  'php', 'phtml', 'php3', 'php4', 'php5',
  'rb', 'rbw', 'gemspec',
  'go', 'mod', 'sum',
  'rs', 'rlib',
  'swift', 'm', 'mm',
  'dart', 'sql', 'sh', 'bash', 'zsh', 'fish',
  'md', 'markdown', 'txt', 'log',
  'dockerfile', 'docker-compose', 'makefile', 'cmake'
];

/**
 * Common image extensions
 */
const IMAGE_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'
];

/**
 * Common document extensions
 */
const DOCUMENT_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'
];

module.exports = {
  handleValidationErrors,
  isValidObjectId,
  sanitizeFilename,
  isAllowedExtension,
  isValidFileSize,
  CODE_FILE_EXTENSIONS,
  IMAGE_EXTENSIONS,
  DOCUMENT_EXTENSIONS
};
