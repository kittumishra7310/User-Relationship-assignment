import { NextResponse } from 'next/server';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'User Relationship & Hobby Network API',
    version: '1.0.0',
    description: 'API for managing users, friendships, and hobbies with popularity scoring',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  paths: {
    '/api/users': {
      get: {
        summary: 'Get all users',
        tags: ['Users'],
        responses: {
          '200': {
            description: 'List of all users with popularity scores',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a new user',
        tags: ['Users'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'age', 'hobbies'],
                properties: {
                  username: { type: 'string', example: 'John Doe' },
                  age: { type: 'number', minimum: 1, maximum: 150, example: 25 },
                  hobbies: { type: 'array', items: { type: 'string' }, example: ['Reading', 'Gaming'] },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation error' },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        summary: 'Get user by ID',
        tags: ['Users'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'User found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '404': { description: 'User not found' },
        },
      },
      put: {
        summary: 'Update user',
        tags: ['Users'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'age', 'hobbies'],
                properties: {
                  username: { type: 'string' },
                  age: { type: 'number', minimum: 1, maximum: 150 },
                  hobbies: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'User updated successfully' },
          '400': { description: 'Validation error' },
          '404': { description: 'User not found' },
        },
      },
      delete: {
        summary: 'Delete user',
        tags: ['Users'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': { description: 'User deleted successfully' },
          '404': { description: 'User not found' },
          '409': { description: 'Cannot delete user with existing friendships' },
        },
      },
    },
    '/api/users/{id}/link': {
      post: {
        summary: 'Create friendship between users',
        tags: ['Friendships'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['targetUserId'],
                properties: {
                  targetUserId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Friendship created successfully' },
          '400': { description: 'Validation error or users not found' },
        },
      },
    },
    '/api/users/{id}/unlink': {
      delete: {
        summary: 'Remove friendship between users',
        tags: ['Friendships'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['targetUserId'],
                properties: {
                  targetUserId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Friendship removed successfully' },
          '404': { description: 'Friendship not found' },
        },
      },
    },
    '/api/graph': {
      get: {
        summary: 'Get graph data (users and relationships)',
        tags: ['Graph'],
        responses: {
          '200': {
            description: 'Graph data with users and edges',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                    edges: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          source: { type: 'string' },
                          target: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
          username: { type: 'string', example: 'John Doe' },
          age: { type: 'number', example: 25 },
          hobbies: { type: 'array', items: { type: 'string' }, example: ['Reading', 'Gaming'] },
          friends: { type: 'array', items: { type: 'string', format: 'uuid' } },
          popularityScore: { 
            type: 'number', 
            description: 'Calculated as: unique friends + (shared hobbies × 0.5)',
            example: 3.5 
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(swaggerDocument);
}
