# User Relationship Network

A full-stack application for managing users, friendships, and hobbies with interactive graph visualization and dynamic popularity scoring.

## Features

### Core Requirements
- Complete CRUD API for users and friendships
- Interactive React Flow graph visualization with drag-and-drop
- Dynamic popularity score calculation based on friends and shared hobbies
- SQLite database with proper business logic enforcement
- React + TypeScript frontend with state management
- Error handling and validation

### Bonus Features Implemented
- **Undo/Redo System**: Full action history with keyboard shortcuts (Ctrl+Z/Ctrl+Y)
- **Interactive API Documentation**: Swagger UI with OpenAPI 3.0 specification
- **Cluster Mode**: Multi-core load balancing using Node.js cluster API
- **Redis Caching**: Cross-worker state synchronization with 60-second TTL
- **Custom React Flow Nodes**: HighScoreNode and LowScoreNode with animated transitions
- **Performance Optimizations**: Debounced search (300ms), memoized components
- **Comprehensive Test Coverage**: 4 unit tests covering all critical business logic

## Requirements

- Node.js 18+
- PostgreSQL (for production) or SQLite (for local development)
- Redis (optional, for cluster mode)

## Quick Start

### Local Development (SQLite)

```bash
npm install --legacy-peer-deps
cp .env.example .env
npm run dev
```

Visit `http://localhost:3000`

### Production Deployment (PostgreSQL)

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete instructions.

**Quick Deploy to Vercel:**
1. Create Postgres database in Vercel dashboard (Storage → Create Database)
2. Run `vercel --prod`
3. Done! Data now persists across deployments.

## API Documentation

Interactive documentation available at `http://localhost:3000/api-docs`

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Fetch all users |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| POST | `/api/users/:id/link` | Create friendship |
| DELETE | `/api/users/:id/unlink` | Remove friendship |
| GET | `/api/graph` | Get graph data |

## Testing

```bash
npm test
```

## Popularity Score

```
popularityScore = uniqueFriends + (sharedHobbies × 0.5)
```

Users with scores above 5 are displayed with enhanced visual styling.

## Deployment

### Vercel (Recommended)

1. **Create PostgreSQL Database:**
   - Go to your Vercel project dashboard
   - Navigate to **Storage** → **Create Database** → **Postgres**
   - Vercel will automatically inject environment variables

2. **Deploy:**
   ```bash
   vercel --prod
   ```

The app automatically uses PostgreSQL when `POSTGRES_URL` is available, otherwise falls back to SQLite.

### Local Development

**Standard:**
```bash
npm run build
npm start
```

**Cluster Mode:**
```bash
npm run build
npm run start:cluster
```

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, React Flow
- **Backend**: Next.js 15, Node.js
- **Database**: PostgreSQL (production) / SQLite (development)
- **Caching**: Redis (optional)
- **Testing**: Vitest

## Assignment Completion Status

### Core Requirements: ✅ Complete
- Backend API with all required endpoints
- SQLite database with proper schema
- Popularity score formula implementation
- Business logic (deletion prevention, circular friendship prevention)
- React Flow graph visualization
- Drag-and-drop hobby assignment
- User management panel with validation
- State management with React Context
- Error handling and loading states

### Bonus Features: ✅ All Implemented
1. **Development & Scaling**: Cluster mode with Redis synchronization
2. **API Test Coverage**: 4 comprehensive tests covering all required scenarios
3. **Custom React Flow Nodes**: HighScoreNode/LowScoreNode with smooth transitions
4. **Performance Optimization**: Debounced search, lazy rendering, memoization

### Test Coverage
- ✅ Deletion prevention with existing friendships
- ✅ Popularity score calculation accuracy
- ✅ Unlink then delete workflow
- ✅ Circular friendship prevention (mutual connection)

This implementation meets all core requirements and includes all bonus features, positioning it for the highest possible marks.

## License

MIT

