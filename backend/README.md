# Cursor Clone Backend

AI-powered code editor backend API built with Node.js, Express, MongoDB, and OpenAI integration.

## 🚀 Features

- **Authentication System**: JWT-based auth with bcrypt password hashing
- **Workspace Management**: Create, manage, and organize coding workspaces
- **File Management**: Complete CRUD operations for files and folders
- **AI Integration**: OpenAI API integration for code generation, explanation, and debugging
- **Real-time Communication**: Socket.IO for live collaboration and streaming
- **Terminal Support**: Secure command execution with session management
- **Chat System**: AI-powered chat with conversation history
- **Security**: Rate limiting, input validation, and CORS protection

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **Real-time**: Socket.IO
- **AI**: OpenAI API
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **File Upload**: Multer
- **Environment**: dotenv

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── workspaceController.js # Workspace management
│   ├── fileController.js    # File operations
│   ├── aiController.js      # AI service endpoints
│   └── terminalController.js # Terminal command execution
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── errorHandler.js     # Centralized error handling
├── models/
│   ├── User.js              # User schema and methods
│   ├── Workspace.js         # Workspace schema
│   ├── File.js              # File schema with relationships
│   └── Chat.js              # Chat conversation schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── workspace.js         # Workspace routes
│   ├── file.js              # File management routes
│   ├── ai.js                # AI service routes
│   └── terminal.js          # Terminal command routes
├── services/
│   └── aiService.js         # OpenAI integration service
├── sockets/
│   └── socketHandler.js     # Socket.IO event handlers
├── utils/                   # Utility functions
├── uploads/                  # File upload directory
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
└── server.js                # Main application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- MongoDB 4.4+
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cursor-clone/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/cursor-clone
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   OPENAI_API_KEY=your-openai-api-key
   OPENAI_BASE_URL=https://api.openai.com/v1
   OPENAI_MODEL=gpt-4
   CLIENT_URL=http://localhost:5173
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

5. **Start MongoDB**
   ```bash
   # Using MongoDB Atlas or local installation
   mongod
   ```

6. **Run the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get user profile |
| POST | `/api/auth/logout` | User logout |
| PUT | `/api/auth/profile` | Update user profile |

### Workspace Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workspaces` | Get all user workspaces |
| GET | `/api/workspaces/:id` | Get single workspace |
| POST | `/api/workspaces` | Create new workspace |
| PUT | `/api/workspaces/:id` | Update workspace |
| DELETE | `/api/workspaces/:id` | Delete workspace |
| GET | `/api/workspaces/:id/stats` | Get workspace statistics |

### File Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files/workspace/:workspaceId` | Get workspace files |
| GET | `/api/files/:id` | Get single file |
| POST | `/api/files` | Create new file/folder |
| PUT | `/api/files/:id` | Update file |
| DELETE | `/api/files/:id` | Delete file |
| PUT | `/api/files/:id/rename` | Rename file |

### AI Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Chat with AI (streaming) |
| POST | `/api/ai/generate` | Generate code |
| POST | `/api/ai/explain` | Explain code |
| POST | `/api/ai/refactor` | Refactor code |
| POST | `/api/ai/fix-bugs` | Fix bugs in code |
| POST | `/api/ai/review` | Review code |
| GET | `/api/ai/chats/:workspaceId` | Get chat history |
| GET | `/api/ai/model-info` | Get AI model info |

### Terminal Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/terminal/run` | Run terminal command |
| POST | `/api/terminal/session` | Create terminal session |
| DELETE | `/api/terminal/session/:id` | Close session |
| GET | `/api/terminal/sessions` | Get active sessions |
| GET | `/api/terminal/system-info` | Get system information |

## 🔐 Authentication Flow

1. **Registration**: User creates account with email/password
2. **Login**: Credentials validated, JWT token issued
3. **Token Storage**: Token stored in HTTP-only cookie
4. **Protected Routes**: Middleware verifies JWT token
5. **Token Refresh**: Automatic token refresh on expiry

## 🤖 AI Integration

### OpenAI Service Features

- **Chat Completion**: Streaming responses with context
- **Code Generation**: Generate code from natural language
- **Code Explanation**: Explain code functionality
- **Code Refactoring**: Improve code quality and structure
- **Bug Fixing**: Identify and fix code issues
- **Code Review**: Provide code quality feedback
- **Auto-completion**: Intelligent code suggestions

### Usage Example

```javascript
const aiService = require('./services/aiService');

// Generate code
const code = await aiService.generateCode(
  'Create a React component for a user profile',
  'javascript',
  'Existing component context here'
);

// Explain code
const explanation = await aiService.explainCode(
  'const sum = (a, b) => a + b;',
  'javascript'
);
```

## 🔄 Real-time Features

### Socket.IO Events

| Event | Description | Payload |
|-------|-------------|---------|
| `join-workspace` | Join workspace room | `{ workspaceId }` |
| `file-change` | File content changed | `{ workspaceId, fileId, content }` |
| `cursor-move` | Cursor position update | `{ workspaceId, fileId, position }` |
| `ai-chat-start` | Start AI chat session | `{ workspaceId, chatId }` |
| `terminal-output` | Terminal command output | `{ workspaceId, output, type }` |

### Real-time Collaboration

- **Live File Updates**: See changes in real-time
- **Cursor Tracking**: Track user cursor positions
- **Presence Indicators**: Show active users
- **Typing Indicators**: Show when users are typing

## 🛡️ Security Features

- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize all inputs
- **CORS Protection**: Cross-origin request security
- **Helmet**: Security headers
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security
- **Command Filtering**: Block dangerous terminal commands

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGO_URI` | MongoDB connection | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | Token expiry | 7d |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `OPENAI_MODEL` | Default AI model | gpt-4 |
| `CLIENT_URL` | Frontend URL | http://localhost:5173 |

### MongoDB Schemas

#### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date
}
```

#### Workspace Schema
```javascript
{
  name: String,
  userId: ObjectId,
  description: String,
  settings: Object,
  isActive: Boolean,
  lastAccessed: Date,
  createdAt: Date
}
```

#### File Schema
```javascript
{
  name: String,
  workspaceId: ObjectId,
  content: String,
  language: String,
  path: String,
  isFolder: Boolean,
  parentId: ObjectId,
  size: Number,
  isDeleted: Boolean,
  lastModified: Date,
  createdAt: Date
}
```

#### Chat Schema
```javascript
{
  workspaceId: ObjectId,
  title: String,
  messages: [{
    role: String,
    content: String,
    timestamp: Date,
    tokens: Number
  }],
  totalTokens: Number,
  settings: Object,
  createdAt: Date
}
```

## 🚀 Deployment

### Using Render

1. **Push to GitHub**
2. **Connect to Render**
3. **Configure Environment Variables**
4. **Deploy**

### Using Railway

1. **Install Railway CLI**
2. **Login and link project**
3. **Set environment variables**
4. **Deploy**

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=strong-secret-key
OPENAI_API_KEY=sk-...
CLIENT_URL=https://your-app.com
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- --grep "authentication"
```

## 📝 Error Handling

Centralized error handling middleware:

```javascript
// Custom error types
- ValidationError (400)
- AuthenticationError (401)
- AuthorizationError (403)
- NotFoundError (404)
- DatabaseError (500)
- AIServiceError (500)
```

## 📊 Monitoring

### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Logging

- **Request Logging**: Morgan middleware
- **Error Logging**: Centralized error logger
- **Performance**: Response time tracking

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: README files
- **API Docs**: Swagger/OpenAPI (coming soon)

## 🔄 Version History

- **v1.0.0** - Initial release
- **v1.1.0** - Added real-time features
- **v1.2.0** - Enhanced AI capabilities
- **v1.3.0** - Improved security features

## 🔮 Future Improvements

- **WebSocket Authentication**: Enhanced socket security
- **File Versioning**: Git-like version control
- **Plugin System**: Extensible architecture
- **Multi-model AI**: Support for multiple AI providers
- **Advanced Analytics**: Usage metrics and insights
- **Team Collaboration**: Multi-user workspaces
- **Code Execution**: Sandbox code runner
- **Database Backups**: Automated backup system
