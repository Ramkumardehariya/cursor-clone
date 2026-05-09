const express = require('express');
const { body } = require('express-validator');
const {
  chatWithAI,
  generateCode,
  explainCode,
  refactorCode,
  fixBugs,
  codeCompletion,
  reviewCode,
  getChatHistory,
  getChat,
  deleteChat,
  analyzeCode,
  generateTests,
  optimizeCode,
  translateCode,
  generateDocumentation,
  getContextualSuggestions,
  detectCodeSmells,
  generateCommitMessage,
  getModelInfo
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Validation rules
const chatValidation = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 4000 })
    .withMessage('Message cannot be more than 4000 characters'),
  body('workspaceId')
    .isMongoId()
    .withMessage('Valid workspace ID is required'),
  body('chatId')
    .optional()
    .isMongoId()
    .withMessage('Valid chat ID is required'),
  body('temperature')
    .optional()
    .isFloat({ min: 0, max: 2 })
    .withMessage('Temperature must be between 0 and 2'),
  body('maxTokens')
    .optional()
    .isInt({ min: 1, max: 4096 })
    .withMessage('Max tokens must be between 1 and 4096')
];

const generateCodeValidation = [
  body('prompt')
    .trim()
    .notEmpty()
    .withMessage('Prompt is required')
    .isLength({ max: 2000 })
    .withMessage('Prompt cannot be more than 2000 characters'),
  body('language')
    .optional()
    .isString()
    .withMessage('Language must be a string'),
  body('context')
    .optional()
    .isString()
    .withMessage('Context must be a string')
];

const explainCodeValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ max: 10000 })
    .withMessage('Code cannot be more than 10000 characters'),
  body('language')
    .optional()
    .isString()
    .withMessage('Language must be a string')
];

const refactorCodeValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ max: 10000 })
    .withMessage('Code cannot be more than 10000 characters'),
  body('language')
    .optional()
    .isString()
    .withMessage('Language must be a string'),
  body('instructions')
    .optional()
    .isString()
    .withMessage('Instructions must be a string')
];

const fixBugsValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ max: 10000 })
    .withMessage('Code cannot be more than 10000 characters'),
  body('language')
    .optional()
    .isString()
    .withMessage('Language must be a string'),
  body('errorDescription')
    .optional()
    .isString()
    .withMessage('Error description must be a string')
];

const codeCompletionValidation = [
  body('prefix')
    .trim()
    .notEmpty()
    .withMessage('Prefix is required')
    .isLength({ max: 5000 })
    .withMessage('Prefix cannot be more than 5000 characters'),
  body('suffix')
    .optional()
    .isString()
    .withMessage('Suffix must be a string'),
  body('language')
    .optional()
    .isString()
    .withMessage('Language must be a string')
];

const reviewCodeValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ max: 10000 })
    .withMessage('Code cannot be more than 10000 characters'),
  body('language')
    .optional()
    .isString()
    .withMessage('Language must be a string')
];

// Additional validation rules for new endpoints
const analyzeCodeValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ max: 15000 })
    .withMessage('Code cannot be more than 15000 characters'),
  body('language')
    .optional()
    .isString()
    .withMessage('Language must be a string'),
  body('options')
    .optional()
    .isObject()
    .withMessage('Options must be an object')
];

const generateTestsValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ max: 10000 })
    .withMessage('Code cannot be more than 10000 characters'),
  body('language')
    .optional()
    .isString()
    .withMessage('Language must be a string'),
  body('testFramework')
    .optional()
    .isString()
    .withMessage('Test framework must be a string')
];

const optimizeCodeValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ max: 10000 })
    .withMessage('Code cannot be more than 10000 characters'),
  body('language')
    .optional()
    .isString()
    .withMessage('Language must be a string'),
  body('optimizationGoals')
    .optional()
    .isArray()
    .withMessage('Optimization goals must be an array')
];

const translateCodeValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ max: 10000 })
    .withMessage('Code cannot be more than 10000 characters'),
  body('fromLanguage')
    .notEmpty()
    .withMessage('Source language is required'),
  body('toLanguage')
    .notEmpty()
    .withMessage('Target language is required')
];

const generateDocsValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ max: 10000 })
    .withMessage('Code cannot be more than 10000 characters'),
  body('language')
    .optional()
    .isString()
    .withMessage('Language must be a string'),
  body('format')
    .optional()
    .isString()
    .withMessage('Format must be a string')
];

const suggestionsValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ max: 5000 })
    .withMessage('Code cannot be more than 5000 characters'),
  body('cursorPosition')
    .isInt({ min: 0 })
    .withMessage('Cursor position must be a non-negative integer'),
  body('language')
    .optional()
    .isString()
    .withMessage('Language must be a string')
];

const detectSmellsValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ max: 10000 })
    .withMessage('Code cannot be more than 10000 characters'),
  body('language')
    .optional()
    .isString()
    .withMessage('Language must be a string')
];

const commitMessageValidation = [
  body('diff')
    .trim()
    .notEmpty()
    .withMessage('Diff is required')
    .isLength({ max: 5000 })
    .withMessage('Diff cannot be more than 5000 characters'),
  body('style')
    .optional()
    .isString()
    .withMessage('Style must be a string')
];

// Routes
router.post('/chat', chatValidation, chatWithAI);
router.post('/generate', generateCodeValidation, generateCode);
router.post('/explain', explainCodeValidation, explainCode);
router.post('/refactor', refactorCodeValidation, refactorCode);
router.post('/fix-bugs', fixBugsValidation, fixBugs);
router.post('/complete', codeCompletionValidation, codeCompletion);
router.post('/review', reviewCodeValidation, reviewCode);

// New advanced AI routes
router.post('/analyze', analyzeCodeValidation, analyzeCode);
router.post('/generate-tests', generateTestsValidation, generateTests);
router.post('/optimize', optimizeCodeValidation, optimizeCode);
router.post('/translate', translateCodeValidation, translateCode);
router.post('/generate-docs', generateDocsValidation, generateDocumentation);
router.post('/suggestions', suggestionsValidation, getContextualSuggestions);
router.post('/detect-smells', detectSmellsValidation, detectCodeSmells);
router.post('/commit-message', commitMessageValidation, generateCommitMessage);

// Chat management routes
router.get('/chats/:workspaceId', getChatHistory);
router.get('/chats/:workspaceId/:chatId', getChat);
router.delete('/chats/:workspaceId/:chatId', deleteChat);

// Model info route
router.get('/model-info', getModelInfo);

module.exports = router;
