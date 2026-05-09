const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const File = require('../models/File');

// Mock data
const mockUsers = [
  {
    name: 'Demo User',
    email: 'demo@cursorclone.com',
    password: 'demo123',
    subscription: {
      plan: 'pro',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    },
    usage: {
      totalTokens: 1000,
      monthlyTokens: 100
    },
    isActive: true
  }
];

const mockWorkspaces = [
  {
    name: 'React Project',
    description: 'A modern React application with TypeScript',
    settings: {
      theme: 'dark',
      fontSize: 14,
      tabSize: 4
    }
  },
  {
    name: 'Node.js API',
    description: 'RESTful API built with Node.js and Express',
    settings: {
      theme: 'dark',
      fontSize: 16,
      tabSize: 2
    }
  }
];

const mockFiles = [
  {
    name: 'App.jsx',
    path: '/src/App.jsx',
    language: 'javascript',
    content: `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Cursor Clone</h1>
        <p>Your AI-powered code editor</p>
      </header>
    </div>
  );
}

export default App;`,
    isFolder: false
  },
  {
    name: 'index.js',
    path: '/src/index.js',
    language: 'javascript',
    content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
    isFolder: false
  },
  {
    name: 'styles.css',
    path: '/src/styles.css',
    language: 'css',
    content: `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

.App-header h1 {
  margin-bottom: 16px;
}

.App-header p {
  font-size: 16px;
  opacity: 0.8;
}`,
    isFolder: false
  },
  {
    name: 'package.json',
    path: '/package.json',
    language: 'json',
    content: `{
  "name": "cursor-clone-app",
  "version": "1.0.0",
  "description": "AI-powered code editor",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-scripts": "5.0.1"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`,
    isFolder: false
  },
  {
    name: 'README.md',
    path: '/README.md',
    language: 'markdown',
    content: `# Cursor Clone

An AI-powered code editor built with React and Node.js.

## Features

- 🚀 AI-powered code completion
- 🎨 Modern dark theme
- 📁 File explorer
- 🖥️ Integrated terminal
- 💬 AI chat assistant

## Getting Started

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Start the development server: \`npm run dev\`
4. Open your browser to \`http://localhost:5173\`

## Technology Stack

- **Frontend**: React 18, TypeScript, Monaco Editor
- **Backend**: Node.js, Express, MongoDB
- **AI**: OpenAI GPT-4
- **Real-time**: Socket.IO

## License

MIT License`,
    isFolder: false
  },
  {
    name: 'server.js',
    path: '/server.js',
    language: 'javascript',
    content: `const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Cursor Clone API Server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
    isFolder: false
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await File.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create users
    const users = await User.create(mockUsers);
    console.log(`👤 Created ${users.length} users`);

    // Create workspaces
    const workspaces = await Workspace.create(
      mockWorkspaces.map((workspace, index) => ({
        ...workspace,
        userId: users[0]._id,
        lastAccessed: new Date()
      }))
    );
    console.log(`📁 Created ${workspaces.length} workspaces`);

    // Create files for each workspace
    for (const workspace of workspaces) {
      const files = mockFiles.map((file, index) => ({
        ...file,
        workspaceId: workspace._id,
        userId: users[0]._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await File.create(files);
      console.log(`📄 Created ${files.length} files for workspace: ${workspace.name}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Created entities:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Workspaces: ${workspaces.length}`);
    console.log(`   - Files: ${workspaces.length * mockFiles.length}`);
    
    console.log('\n🔑 Login credentials:');
    console.log('   Email: demo@cursorclone.com');
    console.log('   Password: demo123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the seeding
seedDatabase();
