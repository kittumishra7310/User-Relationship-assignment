// Database abstraction layer - uses PostgreSQL if available, otherwise SQLite
import type { User, Friendship } from './database-pg';

// Prefer POSTGRES_PRISMA_URL for pooled connections
const USE_POSTGRES = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;

console.log('Environment check:', {
  POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'NOT SET',
  POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? 'SET' : 'NOT SET',
  USE_POSTGRES: !!USE_POSTGRES
});

// Lazy load the appropriate database module
function getDbModule() {
  if (USE_POSTGRES) {
    console.log('Using PostgreSQL database');
    return require('./database-pg');
  } else {
    console.log('Using SQLite database');
    return require('./database');
  }
}

const dbModule = getDbModule();

export const initializeDatabase = dbModule.initializeDatabase;
export const getAllUsers = dbModule.getAllUsers;
export const getUserById = dbModule.getUserById;
export const createUser = dbModule.createUser;
export const updateUser = dbModule.updateUser;
export const deleteUser = dbModule.deleteUser;
export const getAllFriendships = dbModule.getAllFriendships;
export const createFriendship = dbModule.createFriendship;
export const deleteFriendship = dbModule.deleteFriendship;
export const getGraphData = dbModule.getGraphData;

export type { User, Friendship };
