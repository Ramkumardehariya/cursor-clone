const express = require('express');
const { body } = require('express-validator');
const {
  getWorkspaceFiles,
  getFile,
  createFile,
  updateFile,
  deleteFile,
  renameFile,
  searchFiles,
  moveFile,
  duplicateFile,
  getFileStats
} = require('../controllers/fileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Validation rules
const createFileValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('File name is required')
    .isLength({ max: 255 })
    .withMessage('File name cannot be more than 255 characters'),
  body('workspaceId')
    .isMongoId()
    .withMessage('Valid workspace ID is required'),
  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string'),
  body('language')
    .optional()
    .isString()
    .withMessage('Language must be a string'),
  body('path')
    .optional()
    .isString()
    .withMessage('Path must be a string'),
  body('isFolder')
    .optional()
    .isBoolean()
    .withMessage('isFolder must be a boolean'),
  body('parentId')
    .optional()
    .isMongoId()
    .withMessage('Parent ID must be a valid MongoDB ID')
];

const updateFileValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('File name cannot be empty')
    .isLength({ max: 255 })
    .withMessage('File name cannot be more than 255 characters'),
  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string'),
  body('language')
    .optional()
    .isString()
    .withMessage('Language must be a string'),
  body('cursorPosition')
    .optional()
    .isObject()
    .withMessage('Cursor position must be an object'),
  body('cursorPosition.line')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Cursor line must be a positive integer'),
  body('cursorPosition.column')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Cursor column must be a positive integer'),
  body('isOpen')
    .optional()
    .isBoolean()
    .withMessage('isOpen must be a boolean')
];

const renameFileValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('New name is required')
    .isLength({ max: 255 })
    .withMessage('File name cannot be more than 255 characters')
];

const moveFileValidation = [
  body('newParentId')
    .optional()
    .isMongoId()
    .withMessage('Parent ID must be a valid MongoDB ID')
];

// Routes
router.get('/workspace/:workspaceId', getWorkspaceFiles);
router.get('/search/:workspaceId', searchFiles);
router.get('/stats/:workspaceId', getFileStats);
router.get('/:id', getFile);
router.post('/', createFileValidation, createFile);
router.put('/:id', updateFileValidation, updateFile);
router.put('/:id/rename', renameFileValidation, renameFile);
router.put('/:id/move', moveFileValidation, moveFile);
router.post('/:id/duplicate', duplicateFile);
router.delete('/:id', deleteFile);

module.exports = router;
