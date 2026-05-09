const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    });
    this.defaultModel = process.env.OPENAI_MODEL || 'gpt-4';
  }

  // Chat completion with streaming
  async chatCompletion(messages, options = {}) {
    const {
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 2048,
      stream = true,
      onChunk = null
    } = options;

    try {
      const completion = await this.openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream,
      });

      if (stream && onChunk) {
        let fullContent = '';
        
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            onChunk({
              content,
              delta: chunk,
              isComplete: false
            });
          }
        }

        onChunk({
          content: '',
          delta: null,
          isComplete: true,
          fullContent
        });

        return fullContent;
      }

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`AI Service Error: ${error.message}`);
    }
  }

  // Generate code from prompt
  async generateCode(prompt, language = 'javascript', context = '') {
    const messages = [
      {
        role: 'system',
        content: `You are an expert programmer. Generate clean, efficient, and well-commented code in ${language}. Follow best practices and modern conventions.`
      },
      {
        role: 'user',
        content: context ? `${context}\n\n${prompt}` : prompt
      }
    ];

    return this.chatCompletion(messages, {
      temperature: 0.3,
      maxTokens: 2048,
      stream: false
    });
  }

  // Explain code
  async explainCode(code, language = 'javascript') {
    const messages = [
      {
        role: 'system',
        content: 'You are an expert programmer. Explain code clearly and concisely. Focus on what the code does, how it works, and any important patterns or concepts.'
      },
      {
        role: 'user',
        content: `Explain this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ];

    return this.chatCompletion(messages, {
      temperature: 0.3,
      maxTokens: 1024,
      stream: false
    });
  }

  // Refactor code
  async refactorCode(code, language = 'javascript', instructions = '') {
    const messages = [
      {
        role: 'system',
        content: `You are an expert code refactoring specialist. Improve code quality, readability, performance, and maintainability while preserving functionality. Use modern ${language} best practices.`
      },
      {
        role: 'user',
        content: instructions 
          ? `Refactor this ${language} code with these instructions: ${instructions}\n\n\`\`\`${language}\n${code}\n\`\`\``
          : `Refactor this ${language} code to improve quality and maintainability:\n\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ];

    return this.chatCompletion(messages, {
      temperature: 0.2,
      maxTokens: 2048,
      stream: false
    });
  }

  // Fix bugs in code
  async fixBugs(code, language = 'javascript', errorDescription = '') {
    const messages = [
      {
        role: 'system',
        content: `You are an expert debugging specialist. Identify and fix bugs in ${language} code. Explain the issues and provide corrected code with clear explanations.`
      },
      {
        role: 'user',
        content: errorDescription
          ? `Fix the bugs in this ${language} code. Error: ${errorDescription}\n\n\`\`\`${language}\n${code}\n\`\`\``
          : `Find and fix bugs in this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ];

    return this.chatCompletion(messages, {
      temperature: 0.2,
      maxTokens: 2048,
      stream: false
    });
  }

  // Code completion
  async codeCompletion(prefix, suffix = '', language = 'javascript') {
    const messages = [
      {
        role: 'system',
        content: `You are an AI code completion assistant. Complete the code naturally and accurately based on the context. Use ${language} syntax and conventions.`
      },
      {
        role: 'user',
        content: `Complete this ${language} code:\n\n\`\`\`${language}\n${prefix}[COMPLETION]\n${suffix}\n\`\`\``
      }
    ];

    return this.chatCompletion(messages, {
      temperature: 0.1,
      maxTokens: 512,
      stream: false
    });
  }

  // Generate code review
  async reviewCode(code, language = 'javascript') {
    const messages = [
      {
        role: 'system',
        content: `You are a senior code reviewer. Provide constructive feedback on ${language} code. Focus on code quality, security, performance, and best practices.`
      },
      {
        role: 'user',
        content: `Review this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ];

    return this.chatCompletion(messages, {
      temperature: 0.3,
      maxTokens: 1024,
      stream: false
    });
  }

  // Generate documentation
  async generateDocumentation(code, language = 'javascript', docType = 'jsdoc') {
    const messages = [
      {
        role: 'system',
        content: `You are a technical documentation expert. Generate clear and comprehensive documentation for ${language} code using ${docType} format.`
      },
      {
        role: 'user',
        content: `Generate documentation for this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ];

    return this.chatCompletion(messages, {
      temperature: 0.2,
      maxTokens: 1024,
      stream: false
    });
  }

  // Get code suggestions
  async getCodeSuggestions(code, language = 'javascript') {
    const messages = [
      {
        role: 'system',
        content: `You are an expert ${language} developer. Provide helpful suggestions to improve this code, including optimizations, best practices, and alternative approaches.`
      },
      {
        role: 'user',
        content: `Provide suggestions to improve this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ];

    return this.chatCompletion(messages, {
      temperature: 0.4,
      maxTokens: 1024,
      stream: false
    });
  }

  // Validate code syntax
  async validateCode(code, language = 'javascript') {
    const messages = [
      {
        role: 'system',
        content: `You are a syntax validation expert. Check ${language} code for syntax errors, logical issues, and potential problems. Provide specific error locations and suggestions.`
      },
      {
        role: 'user',
        content: `Validate this ${language} code for errors:\n\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ];

    return this.chatCompletion(messages, {
      temperature: 0.1,
      maxTokens: 512,
      stream: false
    });
  }

  // Advanced code analysis
  async analyzeCode(code, language = 'javascript', options = {}) {
    const {
      analysisType = 'comprehensive',
      includeSecurity = true,
      includePerformance = true,
      includeBestPractices = true
    } = options;

    let prompt = `Analyze this ${language} code comprehensively. Provide insights on:\n`;
    
    if (includeSecurity) prompt += `- Security vulnerabilities and potential risks\n`;
    if (includePerformance) prompt += `- Performance bottlenecks and optimization opportunities\n`;
    if (includeBestPractices) prompt += `- Code quality and best practices violations\n`;
    
    prompt += `\n\`\`\`${language}\n${code}\n\`\`\``;

    const messages = [
      {
        role: 'system',
        content: `You are an expert code analyst. Provide detailed, actionable insights with specific line references and recommendations.`
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    return this.chatCompletion(messages, {
      temperature: 0.2,
      maxTokens: 2048,
      stream: false
    });
  }

  // Generate unit tests
  async generateTests(code, language = 'javascript', testFramework = 'jest') {
    const messages = [
      {
        role: 'system',
        content: `You are an expert test engineer. Generate comprehensive unit tests using ${testFramework} for ${language} code. Include edge cases, error handling, and meaningful assertions.`
      },
      {
        role: 'user',
        content: `Generate unit tests for this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ];

    return this.chatCompletion(messages, {
      temperature: 0.3,
      maxTokens: 2048,
      stream: false
    });
  }

  // Optimize code
  async optimizeCode(code, language = 'javascript', optimizationGoals = []) {
    const goals = optimizationGoals.length > 0 ? optimizationGoals.join(', ') : 'performance, readability, and maintainability';
    
    const messages = [
      {
        role: 'system',
        content: `You are a performance optimization expert. Optimize ${language} code focusing on: ${goals}. Provide before/after comparisons and explain the improvements.`
      },
      {
        role: 'user',
        content: `Optimize this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ];

    return this.chatCompletion(messages, {
      temperature: 0.2,
      maxTokens: 2048,
      stream: false
    });
  }

  // Translate code between languages
  async translateCode(code, fromLanguage, toLanguage) {
    const messages = [
      {
        role: 'system',
        content: `You are an expert polyglot programmer. Translate code from ${fromLanguage} to ${toLanguage}. Preserve functionality, adapt to idiomatic patterns, and add comments explaining key differences.`
      },
      {
        role: 'user',
        content: `Translate this ${fromLanguage} code to ${toLanguage}:\n\n\`\`\`${fromLanguage}\n${code}\n\`\`\``
      }
    ];

    return this.chatCompletion(messages, {
      temperature: 0.2,
      maxTokens: 2048,
      stream: false
    });
  }

  // Generate API documentation
  async generateAPIDocumentation(code, language = 'javascript', format = 'openapi') {
    const messages = [
      {
        role: 'system',
        content: `You are a technical documentation expert. Generate ${format} API documentation for ${language} code. Include endpoints, parameters, responses, and examples.`
      },
      {
        role: 'user',
        content: `Generate API documentation for this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ];

    return this.chatCompletion(messages, {
      temperature: 0.2,
      maxTokens: 2048,
      stream: false
    });
  }

  // Smart code suggestions based on context
  async getContextualSuggestions(code, cursorPosition, language = 'javascript') {
    const messages = [
      {
        role: 'system',
        content: `You are an intelligent code completion assistant. Analyze the code context around the cursor position and provide relevant suggestions. Consider variables, functions, imports, and coding patterns.`
      },
      {
        role: 'user',
        content: `Provide contextual suggestions for this ${language} code at cursor position ${cursorPosition}:\n\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ];

    return this.chatCompletion(messages, {
      temperature: 0.1,
      maxTokens: 512,
      stream: false
    });
  }

  // Detect code smells and anti-patterns
  async detectCodeSmells(code, language = 'javascript') {
    const messages = [
      {
        role: 'system',
        content: `You are a code quality expert. Identify code smells, anti-patterns, and maintainability issues in ${language} code. Categorize issues by severity and provide specific refactoring suggestions.`
      },
      {
        role: 'user',
        content: `Analyze this ${language} code for code smells and anti-patterns:\n\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ];

    return this.chatCompletion(messages, {
      temperature: 0.2,
      maxTokens: 1536,
      stream: false
    });
  }

  // Generate commit messages
  async generateCommitMessage(diff, style = 'conventional') {
    const messages = [
      {
        role: 'system',
        content: `You are an expert developer. Generate clear, informative commit messages following ${style} commit format. Summarize changes and their impact.`
      },
      {
        role: 'user',
        content: `Generate a commit message for these changes:\n\n\`\`\`diff\n${diff}\n\`\`\``
      }
    ];

    return this.chatCompletion(messages, {
      temperature: 0.3,
      maxTokens: 256,
      stream: false
    });
  }

  // Get model info
  getModelInfo() {
    return {
      model: this.defaultModel,
      provider: 'OpenAI',
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      features: [
        'chat',
        'code-generation',
        'code-explanation',
        'refactoring',
        'bug-fixing',
        'completion',
        'review',
        'documentation',
        'code-analysis',
        'test-generation',
        'optimization',
        'translation',
        'api-documentation',
        'contextual-suggestions',
        'code-smell-detection',
        'commit-message-generation'
      ],
      capabilities: {
        maxTokens: 4096,
        streaming: true,
        temperature: true,
        multipleLanguages: true,
        contextAware: true
      }
    };
  }
}

module.exports = new AIService();
