# Interactive User Relationship & Hobby Network

A full-stack application for managing users, friendships, and hobbies with dynamic graph visualization and popularity scoring.


---

## 🚀 Features

### Core Features
- ✅ Complete CRUD API for users
- ✅ Friendship management with circular prevention
- ✅ Dynamic popularity score calculation
- ✅ Interactive React Flow graph visualization
- ✅ Drag & drop hobby assignment
- ✅ Real-time score updates
- ✅ Custom node types (HighScore/LowScore)
- ✅ Smooth animations with Framer Motion

### Bonus Features
- ✅ **API Documentation** - Interactive Swagger UI
- ✅ **Undo/Redo** - Full action history with keyboard shortcuts
- ✅ **Cluster Mode** - Multi-core load balancing
- ✅ **Redis Caching** - Cross-worker synchronization
- ✅ **Performance Optimizations** - Debouncing, memoization
- ✅ **Comprehensive Tests** - 4 unit tests covering business logic

## 📋 Requirements

- Node.js 18+ 
- npm or yarn
- Redis (optional, for cluster mode)

## 🛠️ Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd user-relationship-graph-network

# Install dependencies
npm install --legacy-peer-deps

# Create environment file
cp .env.example .env

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_PATH=./data/network.db

# API Configuration
API_BASE_URL=http://localhost:3000/api

# Redis (Optional - for cluster mode)
REDIS_URL=redis://localhost:6379
```

## 📚 API Documentation

Interactive API documentation available at:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI Spec**: `http://localhost:3000/api/docs`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Fetch all users |
| POST | `/api/users` | Create new user |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| POST | `/api/users/:id/link` | Create friendship |
| DELETE | `/api/users/:id/unlink` | Remove friendship |
| GET | `/api/graph` | Get graph data |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm test -- --ui
```

### Test Coverage
- ✅ Deletion prevention with friends
- ✅ Popularity score calculation
- ✅ Unlink then delete flow
- ✅ Circular friendship prevention

## 🎯 Popularity Score Formula

```
popularityScore = uniqueFriends + (sharedHobbies × 0.5)
```

Where:
- `uniqueFriends` = Total number of friends
- `sharedHobbies` = Sum of hobbies shared with each friend

### Example
User A has 3 friends:
- Friend B: 2 shared hobbies
- Friend C: 1 shared hobby
- Friend D: 0 shared hobbies

Score = 3 + ((2 + 1 + 0) × 0.5) = 3 + 1.5 = **4.5**

## 🎨 User Interface

### Main Graph
- Visual representation of users as nodes
- Friendships shown as edges
- Color-coded by popularity score
- Drag nodes to rearrange
- Connect users by dragging between nodes

### Sidebar
- User management panel
- Draggable hobby library
- Search/filter hobbies
- Undo/Redo buttons
- User details display

### Node Types
- **HighScoreNode** (score > 5): Green gradient, gold border, trophy icon
- **LowScoreNode** (score ≤ 5): Gray gradient, standard styling

## 🚀 Deployment

### Standard Mode
```bash
npm run build
npm start
```

### Cluster Mode (Production)
```bash
npm run build
npm run start:cluster
```

Cluster mode automatically:
- Uses all CPU cores
- Distributes load across workers
- Restarts failed workers
- Requires Redis for state sync (optional)

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repository to Vercel dashboard.

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── api-docs/          # Swagger UI page
│   │   └── page.tsx           # Main page
│   ├── components/            # React components
│   │   ├── NetworkGraph.tsx  # React Flow graph
│   │   ├── Sidebar.tsx       # Control panel
│   │   ├── HighScoreNode.tsx # Custom node
│   │   └── LowScoreNode.tsx  # Custom node
│   ├── contexts/              # React contexts
│   │   └── NetworkContext.tsx # State management
│   ├── hooks/                 # Custom hooks
│   │   └── useUndoRedo.ts    # Undo/redo logic
│   ├── lib/                   # Utilities
│   │   ├── database.ts       # SQLite operations
│   │   └── redis.ts          # Redis client
│   └── tests/                 # Test files
├── server.js                  # Cluster server
├── vercel.json               # Vercel config
└── .env.example              # Environment template
```

## 🎮 Usage Guide

### Creating Users
1. Click "Add User" in sidebar
2. Fill in username, age, and hobbies
3. Click "Create"

### Adding Friendships
**Method 1**: Drag between nodes
- Drag from one node's edge to another

**Method 2**: Select and link
- Select a user
- Click "Link" and choose target user

### Adding Hobbies
**Method 1**: Drag and drop
- Drag hobby from sidebar onto node

**Method 2**: Click to toggle
- Select a user
- Click hobbies in sidebar to toggle

### Undo/Redo
- Click undo/redo buttons in sidebar
- Or use keyboard: `Ctrl+Z` (undo), `Ctrl+Y` (redo)

## 🔒 Business Rules

1. **Deletion Prevention**: Cannot delete user with existing friendships
2. **Circular Prevention**: A→B and B→A stored as single friendship
3. **Self-Link Prevention**: Cannot link user to themselves
4. **Duplicate Prevention**: Cannot create duplicate friendships

## ⚡ Performance Features

- **Debounced Search**: 300ms delay on hobby filtering
- **Memoized Components**: React.memo on all nodes
- **Redis Caching**: 60-second TTL on user/graph data
- **Cluster Mode**: Multi-core CPU utilization
- **Optimized Queries**: Indexed database lookups

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Database Issues
```bash
# Delete and recreate database
rm -rf data/network.db
npm run dev
```

### Redis Connection Fails
- Redis is optional - app works without it
- Check REDIS_URL in .env
- Ensure Redis server is running

### Tests Fail
```bash
# Reinstall test dependencies
npm install -D jsdom @vitest/ui --legacy-peer-deps
npm test -- --run
```

## 📊 Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js 15, Node.js
- **Database**: SQLite with better-sqlite3
- **Caching**: Redis with ioredis
- **Graph**: React Flow
- **Animation**: Framer Motion
- **Testing**: Vitest, jsdom
- **Documentation**: Swagger UI, OpenAPI 3.0

## 📝 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

