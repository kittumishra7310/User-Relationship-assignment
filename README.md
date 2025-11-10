# User Relationship Network

A full-stack application for managing users, friendships, and hobbies with interactive graph visualization and dynamic popularity scoring.

## Features

- Complete CRUD API for users and friendships
- Interactive React Flow graph visualization with drag-and-drop
- Dynamic popularity score calculation based on friends and shared hobbies
- Undo/redo functionality with keyboard shortcuts
- Interactive API documentation (Swagger UI)
- Redis caching and cluster mode support
- Comprehensive test coverage

## Requirements

- Node.js 18+
- Redis (optional, for cluster mode)

## Quick Start

```bash
npm install --legacy-peer-deps
cp .env.example .env
npm run dev
```

Visit `http://localhost:3000`

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
- **Database**: SQLite
- **Caching**: Redis (optional)
- **Testing**: Vitest

## License

MIT

