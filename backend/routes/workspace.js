const express = require('express');
const { body } = require('express-validator');
const {
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceStats
} = require('../controllers/workspaceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Validation rules
const createWorkspaceValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Workspace name is required')
    .isLength({ max: 100 })
    .withMessage('Workspace name cannot be more than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters')
];

const updateWorkspaceValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Workspace name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Workspace name cannot be more than 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters')
];

// Routes
router.get('/', getWorkspaces);
router.get('/:id', getWorkspace);
router.get('/:id/stats', getWorkspaceStats);
router.post('/', createWorkspaceValidation, createWorkspace);
router.put('/:id', updateWorkspaceValidation, updateWorkspace);
router.delete('/:id', deleteWorkspace);

module.exports = router;
