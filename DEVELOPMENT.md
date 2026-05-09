# Development Setup Guide

This guide covers how to set up and run the Cursor Clone project for development.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone and setup everything automatically
git clone <repository-url>
cd cursor-clone
npm run setup
npm run dev
```

### Option 2: Manual Setup

```bash
# Clone the repository
git clone <repository-url>
cd cursor-clone

# Install all dependencies
npm run install-all

# Start development servers
npm run dev
```

## 🖥️ Platform-Specific Setup

### Windows

#### Method 1: Batch File (Easiest)
```bash
# Double-click or run from command line
start-dev.bat
```

#### Method 2: PowerShell
```powershell
# Run PowerShell script
.\start-dev.ps1
```

#### Method 3: Node.js Script
```bash
# Run the cross-platform script
node dev.js
```

#### Method 4: NPM Script
```bash
# Use the Windows-specific script
npm run dev:windows
```

### macOS

#### Method 1: Node.js Script (Recommended)
```bash
# Run the cross-platform script
node dev.js
```

#### Method 2: NPM Script
```bash
# Use the macOS-specific script
npm run dev:mac
```

#### Method 3: Concurrently
```bash
# Use concurrently to run both servers
npm run dev:concurrent
```

### Linux

#### Method 1: Node.js Script (Recommended)
```bash
# Run the cross-platform script
node dev.js
```

#### Method 2: NPM Script
```bash
# Use the Linux-specific script
npm run dev:linux
```

#### Method 3: Concurrently
```bash
# Use concurrently to run both servers
npm run dev:concurrent
```

## 📁 Project Structure

```
cursor-clone/
├── backend/                 # Node.js API server
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/        # Auth and error middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── sockets/           # Socket.IO handlers
│   ├── utils/             # Utility functions
│   ├── uploads/           # File uploads
│   ├── .env.example        # Environment template
│   ├── package.json        # Backend dependencies
│   └── server.js          # Backend entry point
├── frontend/               # React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── layouts/       # Layout components
│   │   ├── store/         # State management
│   │   ├── services/      # API services
│   │   ├── utils/         # Helper functions
│   │   └── styles/        # Global styles
│   ├── .env.example        # Environment template
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── scripts/                # Development scripts
│   └── dev.js             # Cross-platform dev script
├── dev.js                 # Main development script
├── start-dev.bat          # Windows batch script
├── start-dev.ps1          # PowerShell script
├── package.json            # Root package.json
├── DEVELOPMENT.md          # This file
└── README.md              # Main documentation
```

## 🔧 Environment Setup

### Backend Environment Variables

Create `backend/.env`:

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

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## 📦 Available Scripts

### Root Level Scripts

```bash
npm run install-all      # Install dependencies for all packages
npm run dev              # Start development servers (cross-platform)
npm run dev:concurrent   # Start servers using concurrently
npm run backend         # Start only backend server
npm run frontend        # Start only frontend server
npm run build           # Build frontend for production
npm run start            # Start production servers
npm run clean           # Clean node_modules directories
npm run test             # Run all tests
npm run lint             # Run linting for all packages
npm run setup            # Complete setup (install + start)
```

### Platform-Specific Scripts

```bash
npm run dev:windows      # Windows-specific startup
npm run dev:mac          # macOS-specific startup
npm run dev:linux        # Linux-specific startup
```

### Backend Scripts

```bash
cd backend
npm run dev              # Development with nodemon
npm run dev:debug        # Development with debugging
npm start                # Production server
npm run test             # Run backend tests
npm run lint             # Run backend linting
```

### Frontend Scripts

```bash
cd frontend
npm run dev              # Development server
npm run dev:debug        # Development with debugging
npm run build            # Production build
npm run build:analyze    # Build with bundle analysis
npm run preview          # Preview production build
npm run test             # Run frontend tests
npm run lint             # Run frontend linting
npm run lint:fix         # Fix linting issues
```

## 🌐 Development URLs

When development servers are running:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **API Documentation**: http://localhost:5000/api (when implemented)

## 🔍 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill processes on ports 5000 and 5173 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

#### MongoDB Connection Error
```bash
# Make sure MongoDB is running
# For MongoDB Atlas, check connection string
# For local MongoDB, start the service:
# Windows: Start MongoDB service
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

#### Dependencies Not Found
```bash
# Clean and reinstall
npm run clean
npm run install-all
```

#### Permission Issues (PowerShell)
```powershell
# Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Node.js Version Issues
```bash
# Check Node.js version (should be 16+)
node --version

# Use nvm to switch versions if needed
nvm use 18
nvm install 18
```

### Debug Mode

#### Backend Debugging
```bash
cd backend
npm run dev:debug
# Then connect to localhost:9229 in Chrome DevTools
```

#### Frontend Debugging
```bash
cd frontend
npm run dev:debug
# Use browser DevTools for debugging
```

## 🛠️ Development Workflow

### 1. Start Development
```bash
# From project root
npm run dev
```

### 2. Make Changes
- Backend changes auto-reload with nodemon
- Frontend changes auto-reload with Vite HMR

### 3. Test Changes
- Test API endpoints with Postman or curl
- Test frontend changes in browser
- Check browser console for errors

### 4. Stop Development
```bash
# Press Ctrl+C in the terminal running the dev script
```

## 📊 Development Tips

### Backend Development
- Use `console.log()` for debugging (will appear in dev output)
- Check MongoDB connection in MongoDB Compass
- Test API endpoints with Postman collection
- Use environment variables for configuration

### Frontend Development
- Use React DevTools for component inspection
- Check Network tab for API calls
- Use browser console for JavaScript debugging
- Test responsive design with DevTools device emulation

### General Tips
- Keep backend and frontend terminal windows visible
- Use Git branches for feature development
- Commit frequently with descriptive messages
- Test both frontend and backend changes together

## 🔧 IDE Configuration

### VS Code Extensions (Recommended)
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
- Thunder Client (for API testing)

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "files.associations": {
    "*.jsx": "javascriptreact"
  }
}
```

## 🚀 Production Deployment

### Build for Production
```bash
# Build frontend
npm run build

# Start production servers
npm run start
```

### Environment Variables for Production
```bash
# Backend .env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=strong-production-secret
OPENAI_API_KEY=sk-...

# Frontend .env
VITE_API_URL=https://your-api.com/api
```

## 📝 Contributing

### Development Setup for Contributors
1. Fork the repository
2. Clone your fork
3. Run `npm run setup`
4. Create a feature branch
5. Make changes
6. Test thoroughly
7. Submit a pull request

### Code Quality
- Follow existing code style
- Add comments for complex logic
- Test your changes
- Update documentation if needed

## 🆘 Getting Help

### Common Resources
- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Vite Documentation](https://vitejs.dev/)

### Community Support
- GitHub Issues for bug reports
- GitHub Discussions for questions
- Check existing issues before creating new ones

### Debug Information
When reporting issues, include:
- Operating system and version
- Node.js version
- Browser version (for frontend issues)
- Error messages and stack traces
- Steps to reproduce the issue
