# API Documentation - User Network System

## Overview

This document provides detailed information about the RESTful API endpoints for the User Network system.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, no authentication is required. All endpoints are publicly accessible.

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "user": { ... },
  "users": [ ... ],
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request (Invalid input) |
| 404  | Not Found |
| 500  | Internal Server Error |

---

## Endpoints

### 1. Get All Users

Retrieve all users in the network with their popularity scores.

**Endpoint:** `GET /api/users`

**Request:**
```http
GET /api/users HTTP/1.1
Host: localhost:3000
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "hobbies": ["Reading", "Gaming", "Cooking"],
      "popularityScore": 30
    },
    {
      "id": 2,
      "name": "Bob Smith",
      "hobbies": ["Photography"],
      "popularityScore": 10
    }
  ]
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/users
```

---

### 2. Get User by ID

Retrieve a specific user by their ID.

**Endpoint:** `GET /api/users/:id`

**Parameters:**
- `id` (path parameter) - User ID (integer)

**Request:**
```http
GET /api/users/1 HTTP/1.1
Host: localhost:3000
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "name": "Alice Johnson",
    "hobbies": ["Reading", "Gaming", "Cooking"],
    "popularityScore": 30
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "User not found"
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/users/1
```

---

### 3. Create User

Create a new user in the network.

**Endpoint:** `POST /api/users`

**Request Body:**
```json
{
  "name": "Charlie Brown",
  "hobbies": ["Hiking", "Photography", "Traveling", "Music"]
}
```

**Request:**
```http
POST /api/users HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "name": "Charlie Brown",
  "hobbies": ["Hiking", "Photography", "Traveling", "Music"]
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 3,
    "name": "Charlie Brown",
    "hobbies": ["Hiking", "Photography", "Traveling", "Music"],
    "popularityScore": 40
  }
}
```

**Validation Rules:**
- `name` (required): Non-empty string, max 50 characters
- `hobbies` (optional): Array of strings, defaults to empty array

**Error Response (400 Bad Request):**
```json
{
  "error": "Name is required and must be a non-empty string"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie Brown",
    "hobbies": ["Hiking", "Photography", "Traveling", "Music"]
  }'
```

---

### 4. Update User

Update an existing user's information.

**Endpoint:** `PUT /api/users/:id`

**Parameters:**
- `id` (path parameter) - User ID (integer)

**Request Body:**
```json
{
  "name": "Charlie Brown",
  "hobbies": ["Hiking", "Photography"]
}
```

**Request:**
```http
PUT /api/users/3 HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "name": "Charlie Brown",
  "hobbies": ["Hiking", "Photography"]
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 3,
    "name": "Charlie Brown",
    "hobbies": ["Hiking", "Photography"],
    "popularityScore": 20
  }
}
```

**Validation Rules:**
- `name` (required): Non-empty string
- `hobbies` (required): Array of strings

**Error Response (404 Not Found):**
```json
{
  "error": "User not found"
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/api/users/3 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie Brown",
    "hobbies": ["Hiking", "Photography"]
  }'
```

---

### 5. Delete User

Delete a user and all their friendships.

**Endpoint:** `DELETE /api/users/:id`

**Parameters:**
- `id` (path parameter) - User ID (integer)

**Request:**
```http
DELETE /api/users/3 HTTP/1.1
Host: localhost:3000
```

**Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "User not found"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/users/3
```

---

### 6. Link Users (Create Friendship)

Create a friendship connection between two users.

**Endpoint:** `POST /api/users/:id/link`

**Parameters:**
- `id` (path parameter) - First user ID (integer)

**Request Body:**
```json
{
  "targetUserId": 2
}
```

**Request:**
```http
POST /api/users/1/link HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "targetUserId": 2
}
```

**Response (201 Created):**
```json
{
  "message": "Users linked successfully",
  "friendship": {
    "id": 1,
    "user_id_1": 1,
    "user_id_2": 2
  }
}
```

**Validation Rules:**
- `targetUserId` (required): Valid user ID (integer)
- Cannot link a user to themselves
- Both users must exist
- Duplicate friendships return the existing friendship

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": "Cannot link user to themselves"
}
```

**400 Bad Request:**
```json
{
  "error": "Failed to create friendship. One or both users may not exist."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/users/1/link \
  -H "Content-Type: application/json" \
  -d '{"targetUserId": 2}'
```

---

### 7. Unlink Users (Delete Friendship)

Remove a friendship connection between two users.

**Endpoint:** `POST /api/users/:id/unlink`

**Parameters:**
- `id` (path parameter) - First user ID (integer)

**Request Body:**
```json
{
  "targetUserId": 2
}
```

**Request:**
```http
POST /api/users/1/unlink HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "targetUserId": 2
}
```

**Response (200 OK):**
```json
{
  "message": "Users unlinked successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Friendship not found"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/users/1/unlink \
  -H "Content-Type: application/json" \
  -d '{"targetUserId": 2}'
```

---

### 8. Get Graph Data

Retrieve complete graph data including all users and their connections.

**Endpoint:** `GET /api/graph`

**Request:**
```http
GET /api/graph HTTP/1.1
Host: localhost:3000
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "hobbies": ["Reading", "Gaming", "Cooking"],
      "popularityScore": 30
    },
    {
      "id": 2,
      "name": "Bob Smith",
      "hobbies": ["Photography"],
      "popularityScore": 10
    }
  ],
  "edges": [
    {
      "id": "1-2",
      "source": "1",
      "target": "2"
    }
  ]
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/graph
```

---

## Data Models

### User Object

```typescript
{
  id: number;              // Unique identifier
  name: string;            // User's name
  hobbies: string[];       // Array of hobby names
  popularityScore: number; // Calculated score (hobbies.length * 10)
}
```

### Edge Object

```typescript
{
  id: string;    // Format: "userId1-userId2"
  source: string; // Source user ID (as string)
  target: string; // Target user ID (as string)
}
```

### Friendship Object

```typescript
{
  id: number;       // Unique identifier
  user_id_1: number; // First user ID (smaller)
  user_id_2: number; // Second user ID (larger)
}
```

---

## Popularity Score Calculation

The popularity score is automatically calculated based on the number of hobbies:

```
popularityScore = numberOfHobbies × 10
```

**Examples:**
- 0 hobbies → 0 points
- 1 hobby → 10 points
- 3 hobbies → 30 points (High Score threshold)
- 5 hobbies → 50 points

---

## Best Practices

1. **Always validate input data** before sending requests
2. **Handle error responses** appropriately in your client application
3. **Use appropriate HTTP methods** (GET for reading, POST for creating, PUT for updating, DELETE for removing)
4. **Check status codes** to determine request success
5. **Store user IDs** for subsequent operations rather than searching by name

---

## Testing Examples

### JavaScript/Fetch

```javascript
// Get all users
const users = await fetch('http://localhost:3000/api/users')
  .then(res => res.json());

// Create a user
const newUser = await fetch('http://localhost:3000/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'David Lee',
    hobbies: ['Coding', 'Gaming']
  })
}).then(res => res.json());

// Link users
await fetch('http://localhost:3000/api/users/1/link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ targetUserId: 2 })
});
```

---

## Error Handling

All endpoints return appropriate HTTP status codes and error messages. Always check the response status and handle errors gracefully:

```javascript
try {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  const data = await response.json();
  // Handle success
} catch (error) {
  // Handle error
  console.error('API Error:', error.message);
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing rate limiting to prevent abuse.

## Support

For issues or questions about the API, please refer to the main README.md or contact the development team.
