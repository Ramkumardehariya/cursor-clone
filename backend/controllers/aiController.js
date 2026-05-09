const aiService = require('../services/aiService');
const Chat = require('../models/Chat');
const { validationResult } = require('express-validator');

// @desc    Chat with AI
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { message, workspaceId, chatId, temperature, maxTokens } = req.body;

    let chat;
    
    // Create or get chat
    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat || chat.workspaceId.toString() !== workspaceId) {
        return res.status(404).json({
          success: false,
          error: 'Chat not found'
        });
      }
    } else {
      // Create new chat
      chat = new Chat({
        workspaceId,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        settings: {
          temperature: temperature || 0.7,
          maxTokens: maxTokens || 2048
        }
      });
    }

    // Get chat history
    const messages = chat.getRecentMessages(20);
    messages.push({ role: 'user', content: message });

    // Add system message if this is the first message
    if (messages.length === 1) {
      messages.unshift({
        role: 'system',
        content: chat.settings.systemPrompt
      });
    }

    // Set up streaming response
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    let fullResponse = '';

    try {
      await aiService.chatCompletion(messages, {
        temperature: temperature || chat.settings.temperature,
        maxTokens: maxTokens || chat.settings.maxTokens,
        onChunk: (chunk) => {
          if (chunk.content) {
            fullResponse += chunk.content;
            res.write(`data: ${JSON.stringify({ content: chunk.content, isComplete: false })}\n\n`);
          }
          
          if (chunk.isComplete) {
            // Save messages to database
            chat.addMessage('user', message);
            chat.addMessage('assistant', chunk.fullContent);
            
            res.write(`data: ${JSON.stringify({ 
              content: '', 
              isComplete: true,
              chatId: chat._id,
              title: chat.title
            })}\n\n`);
            res.end();
          }
        }
      });
    } catch (error) {
      console.error('AI Chat error:', error);
      res.write(`data: ${JSON.stringify({ 
        error: 'AI service error: ' + error.message,
        isComplete: true
      })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('Chat controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Generate code
// @route   POST /api/ai/generate
// @access  Private
const generateCode = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { prompt, language, context, temperature, maxTokens } = req.body;

    const response = await aiService.generateCode(
      prompt,
      language || 'javascript',
      context || ''
    );

    res.json({
      success: true,
      data: {
        code: response,
        language: language || 'javascript'
      }
    });
  } catch (error) {
    console.error('Generate code error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate code'
    });
  }
};

// @desc    Explain code
// @route   POST /api/ai/explain
// @access  Private
const explainCode = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { code, language } = req.body;

    const explanation = await aiService.explainCode(
      code,
      language || 'javascript'
    );

    res.json({
      success: true,
      data: {
        explanation,
        language: language || 'javascript'
      }
    });
  } catch (error) {
    console.error('Explain code error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to explain code'
    });
  }
};

// @desc    Refactor code
// @route   POST /api/ai/refactor
// @access  Private
const refactorCode = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { code, language, instructions } = req.body;

    const refactoredCode = await aiService.refactorCode(
      code,
      language || 'javascript',
      instructions || ''
    );

    res.json({
      success: true,
      data: {
        originalCode: code,
        refactoredCode,
        language: language || 'javascript'
      }
    });
  } catch (error) {
    console.error('Refactor code error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to refactor code'
    });
  }
};

// @desc    Fix bugs in code
// @route   POST /api/ai/fix-bugs
// @access  Private
const fixBugs = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { code, language, errorDescription } = req.body;

    const fix = await aiService.fixBugs(
      code,
      language || 'javascript',
      errorDescription || ''
    );

    res.json({
      success: true,
      data: {
        originalCode: code,
        fix,
        language: language || 'javascript'
      }
    });
  } catch (error) {
    console.error('Fix bugs error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fix bugs'
    });
  }
};

// @desc    Code completion
// @route   POST /api/ai/complete
// @access  Private
const codeCompletion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { prefix, suffix, language } = req.body;

    const completion = await aiService.codeCompletion(
      prefix,
      suffix || '',
      language || 'javascript'
    );

    res.json({
      success: true,
      data: {
        completion,
        language: language || 'javascript'
      }
    });
  } catch (error) {
    console.error('Code completion error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete code'
    });
  }
};

// @desc    Review code
// @route   POST /api/ai/review
// @access  Private
const reviewCode = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { code, language } = req.body;

    const review = await aiService.reviewCode(
      code,
      language || 'javascript'
    );

    res.json({
      success: true,
      data: {
        review,
        language: language || 'javascript'
      }
    });
  } catch (error) {
    console.error('Review code error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to review code'
    });
  }
};

// @desc    Get chat history
// @route   GET /api/ai/chats/:workspaceId
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const chats = await Chat.find({
      workspaceId,
      isActive: true
    })
    .sort({ lastMessageAt: -1 })
    .select('title totalTokens lastMessageAt createdAt')
    .limit(50);

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single chat
// @route   GET /api/ai/chats/:workspaceId/:chatId
// @access  Private
const getChat = async (req, res) => {
  try {
    const { workspaceId, chatId } = req.params;

    const chat = await Chat.findOne({
      _id: chatId,
      workspaceId,
      isActive: true
    })
    .populate('workspaceId', 'name')
    .select('-__v');

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete chat
// @route   DELETE /api/ai/chats/:workspaceId/:chatId
// @access  Private
const deleteChat = async (req, res) => {
  try {
    const { workspaceId, chatId } = req.params;

    const chat = await Chat.findOneAndUpdate(
      {
        _id: chatId,
        workspaceId,
        isActive: true
      },
      { isActive: false },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Analyze code
// @route   POST /api/ai/analyze
// @access  Private
const analyzeCode = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { code, language, options } = req.body;

    const analysis = await aiService.analyzeCode(
      code,
      language || 'javascript',
      options || {}
    );

    res.json({
      success: true,
      data: {
        analysis,
        language: language || 'javascript'
      }
    });
  } catch (error) {
    console.error('Analyze code error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze code'
    });
  }
};

// @desc    Generate tests
// @route   POST /api/ai/generate-tests
// @access  Private
const generateTests = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { code, language, testFramework } = req.body;

    const tests = await aiService.generateTests(
      code,
      language || 'javascript',
      testFramework || 'jest'
    );

    res.json({
      success: true,
      data: {
        tests,
        language: language || 'javascript',
        testFramework: testFramework || 'jest'
      }
    });
  } catch (error) {
    console.error('Generate tests error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate tests'
    });
  }
};

// @desc    Optimize code
// @route   POST /api/ai/optimize
// @access  Private
const optimizeCode = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { code, language, optimizationGoals } = req.body;

    const optimized = await aiService.optimizeCode(
      code,
      language || 'javascript',
      optimizationGoals || []
    );

    res.json({
      success: true,
      data: {
        originalCode: code,
        optimizedCode: optimized,
        language: language || 'javascript'
      }
    });
  } catch (error) {
    console.error('Optimize code error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to optimize code'
    });
  }
};

// @desc    Translate code
// @route   POST /api/ai/translate
// @access  Private
const translateCode = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { code, fromLanguage, toLanguage } = req.body;

    const translated = await aiService.translateCode(
      code,
      fromLanguage,
      toLanguage
    );

    res.json({
      success: true,
      data: {
        originalCode: code,
        translatedCode: translated,
        fromLanguage,
        toLanguage
      }
    });
  } catch (error) {
    console.error('Translate code error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to translate code'
    });
  }
};

// @desc    Generate API documentation
// @route   POST /api/ai/generate-docs
// @access  Private
const generateDocumentation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { code, language, format } = req.body;

    const docs = await aiService.generateAPIDocumentation(
      code,
      language || 'javascript',
      format || 'openapi'
    );

    res.json({
      success: true,
      data: {
        documentation: docs,
        language: language || 'javascript',
        format: format || 'openapi'
      }
    });
  } catch (error) {
    console.error('Generate documentation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate documentation'
    });
  }
};

// @desc    Get contextual suggestions
// @route   POST /api/ai/suggestions
// @access  Private
const getContextualSuggestions = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { code, cursorPosition, language } = req.body;

    const suggestions = await aiService.getContextualSuggestions(
      code,
      cursorPosition,
      language || 'javascript'
    );

    res.json({
      success: true,
      data: {
        suggestions,
        language: language || 'javascript'
      }
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get suggestions'
    });
  }
};

// @desc    Detect code smells
// @route   POST /api/ai/detect-smells
// @access  Private
const detectCodeSmells = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { code, language } = req.body;

    const smells = await aiService.detectCodeSmells(
      code,
      language || 'javascript'
    );

    res.json({
      success: true,
      data: {
        codeSmells: smells,
        language: language || 'javascript'
      }
    });
  } catch (error) {
    console.error('Detect code smells error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to detect code smells'
    });
  }
};

// @desc    Generate commit message
// @route   POST /api/ai/commit-message
// @access  Private
const generateCommitMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { diff, style } = req.body;

    const commitMessage = await aiService.generateCommitMessage(
      diff,
      style || 'conventional'
    );

    res.json({
      success: true,
      data: {
        commitMessage,
        style: style || 'conventional'
      }
    });
  } catch (error) {
    console.error('Generate commit message error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate commit message'
    });
  }
};

// @desc    Get AI model info
// @route   GET /api/ai/model-info
// @access  Private
const getModelInfo = async (req, res) => {
  try {
    const modelInfo = aiService.getModelInfo();

    res.json({
      success: true,
      data: modelInfo
    });
  } catch (error) {
    console.error('Get model info error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
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
};
