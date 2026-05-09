const express = require('express');
const { body } = require('express-validator');
const {
  runCommand,
  createSession,
  closeSession,
  getSessions,
  getSystemInfo,
  getCommandHistory,
  changeDirectory,
  getTerminalOutput
} = require('../controllers/terminalController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Validation rules
const runCommandValidation = [
  body('command')
    .trim()
    .notEmpty()
    .withMessage('Command is required')
    .isLength({ max: 1000 })
    .withMessage('Command cannot be more than 1000 characters'),
  body('workspaceId')
    .optional()
    .isMongoId()
    .withMessage('Valid workspace ID is required'),
  body('sessionId')
    .optional()
    .isString()
    .withMessage('Session ID must be a string')
];

const createSessionValidation = [
  body('workspaceId')
    .optional()
    .isMongoId()
    .withMessage('Valid workspace ID is required')
];

const changeDirectoryValidation = [
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
    .isString()
    .withMessage('Session ID must be a string'),
  body('directory')
    .notEmpty()
    .withMessage('Directory is required')
    .isString()
    .withMessage('Directory must be a string')
];

// Routes
router.post('/run', runCommandValidation, runCommand);
router.post('/session', createSessionValidation, createSession);
router.delete('/session/:sessionId', closeSession);
router.get('/sessions', getSessions);
router.get('/system-info', getSystemInfo);
router.get('/history/:sessionId?', getCommandHistory);
router.post('/cd', changeDirectoryValidation, changeDirectory);
router.get('/output/:sessionId', getTerminalOutput);

module.exports = router;
