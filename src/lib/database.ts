import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Resolve database path
const envDbPath = process.env.DATABASE_PATH;
let dbPath = envDbPath
  ? (path.isAbsolute(envDbPath) ? envDbPath : path.join(process.cwd(), envDbPath))
  : path.join(process.cwd(), 'data', 'network.db');

// If using a writable temp path (e.g., Vercel) and the DB doesn't exist yet, seed it from repo copy
try {
  const isTmp = dbPath.startsWith('/tmp');
  if (isTmp && !fs.existsSync(dbPath)) {
    const source = path.join(process.cwd(), 'data', 'network.db');
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    
    // Copy if source exists, otherwise create new DB
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, dbPath);
      console.log('Database copied from source to /tmp');
    } else {
      console.log('No source database found, will create new one');
    }
  }
} catch (error) {
  console.error('Error setting up database:', error);
}

const db = new Database(dbPath);
console.log('Database initialized at:', dbPath);

// Initialize database schema
export function initializeDatabase() {
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create users table with UUIDs
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      age INTEGER NOT NULL,
      hobbies TEXT NOT NULL DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create friendships table with UUIDs
  db.exec(`
    CREATE TABLE IF NOT EXISTS friendships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id_1 TEXT NOT NULL,
      user_id_2 TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id_1, user_id_2)
    )
  `);

  // Create index for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_friendships_user_1 ON friendships(user_id_1);
    CREATE INDEX IF NOT EXISTS idx_friendships_user_2 ON friendships(user_id_2);
  `);
}

// Initialize on import
try {
  initializeDatabase();
} catch (error) {
  console.error('Database initialization error:', error);
}

export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
  friends: string[];
  popularityScore: number;
  createdAt: string;
}

export interface Friendship {
  id: number;
  user_id_1: string;
  user_id_2: string;
}

// Calculate popularity score: unique friends + (shared hobbies with friends × 0.5)
function calculatePopularityScore(userId: string, hobbies: string[]): number {
  // Get all friends for this user
  const friendIds = getUserFriendships(userId);
  const uniqueFriendsCount = friendIds.length;
  
  if (uniqueFriendsCount === 0) {
    return 0;
  }
  
  // Calculate total shared hobbies with all friends
  let totalSharedHobbies = 0;
  
  for (const friendId of friendIds) {
    const stmt = db.prepare(`SELECT hobbies FROM users WHERE id = ?`);
    const friendRow = stmt.get(friendId) as { hobbies: string } | undefined;
    
    if (friendRow) {
      const friendHobbies = JSON.parse(friendRow.hobbies) as string[];
      const sharedCount = hobbies.filter(hobby => friendHobbies.includes(hobby)).length;
      totalSharedHobbies += sharedCount;
    }
  }
  
  const score = uniqueFriendsCount + (totalSharedHobbies * 0.5);
  return Math.round(score * 10) / 10; // Round to 1 decimal place
}

// Get all users with popularity scores
export function getAllUsers(): User[] {
  const stmt = db.prepare(`SELECT id, username, age, hobbies, created_at FROM users`);
  const rows = stmt.all() as { id: string; username: string; age: number; hobbies: string; created_at: string }[];
  
  return rows.map(row => {
    const hobbies = JSON.parse(row.hobbies);
    const friends = getUserFriendships(row.id);
    return {
      id: row.id,
      username: row.username,
      age: row.age,
      hobbies,
      friends,
      popularityScore: calculatePopularityScore(row.id, hobbies),
      createdAt: row.created_at
    };
  });
}

// Get user by ID
export function getUserById(id: string): User | null {
  const stmt = db.prepare(`SELECT id, username, age, hobbies, created_at FROM users WHERE id = ?`);
  const row = stmt.get(id) as { id: string; username: string; age: number; hobbies: string; created_at: string } | undefined;
  
  if (!row) return null;
  
  const hobbies = JSON.parse(row.hobbies);
  const friends = getUserFriendships(row.id);
  return {
    id: row.id,
    username: row.username,
    age: row.age,
    hobbies,
    friends,
    popularityScore: calculatePopularityScore(row.id, hobbies),
    createdAt: row.created_at
  };
}

// Create a new user
export function createUser(username: string, age: number, hobbies: string[] = []): User {
  const id = uuidv4();
  const stmt = db.prepare(`INSERT INTO users (id, username, age, hobbies) VALUES (?, ?, ?, ?)`);
  stmt.run(id, username, age, JSON.stringify(hobbies));
  
  return {
    id,
    username,
    age,
    hobbies,
    friends: [],
    popularityScore: 0,
    createdAt: new Date().toISOString()
  };
}

// Update user
export function updateUser(id: string, username: string, age: number, hobbies: string[]): User | null {
  const oldUser = getUserById(id);
  if (!oldUser) return null;
  
  const stmt = db.prepare(`UPDATE users SET username = ?, age = ?, hobbies = ? WHERE id = ?`);
  const result = stmt.run(username, age, JSON.stringify(hobbies), id);
  
  if (result.changes === 0) return null;
  
  const friends = getUserFriendships(id);
  return {
    id,
    username,
    age,
    hobbies,
    friends,
    popularityScore: calculatePopularityScore(id, hobbies),
    createdAt: oldUser.createdAt
  };
}

// Delete user - check if user has friends first
export function deleteUser(id: string): { success: boolean; error?: string } {
  const friendships = getUserFriendships(id);
  
  if (friendships.length > 0) {
    return {
      success: false,
      error: 'Cannot delete user with existing friendships. Please unlink all friends first.'
    };
  }
  
  const stmt = db.prepare(`DELETE FROM users WHERE id = ?`);
  const result = stmt.run(id);
  
  if (result.changes === 0) {
    return { success: false, error: 'User not found' };
  }
  
  return { success: true };
}

// Get all friendships
export function getAllFriendships(): Friendship[] {
  const stmt = db.prepare(`SELECT id, user_id_1, user_id_2 FROM friendships`);
  return stmt.all() as Friendship[];
}

// Get friendships for a specific user
export function getUserFriendships(userId: string): string[] {
  const stmt = db.prepare(`
    SELECT user_id_2 as friend_id FROM friendships WHERE user_id_1 = ?
    UNION
    SELECT user_id_1 as friend_id FROM friendships WHERE user_id_2 = ?
  `);
  const rows = stmt.all(userId, userId) as { friend_id: string }[];
  return rows.map(row => row.friend_id);
}

// Create friendship (link users)
export function createFriendship(userId1: string, userId2: string): Friendship | null {
  // Ensure userId1 < userId2 for consistency (prevent circular A→B and B→A)
  const [smallerId, largerId] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
  
  const user1 = getUserById(smallerId);
  const user2 = getUserById(largerId);
  
  if (!user1 || !user2) return null;
  
  const existingStmt = db.prepare(`
    SELECT id FROM friendships 
    WHERE user_id_1 = ? AND user_id_2 = ?
  `);
  const existing = existingStmt.get(smallerId, largerId);
  
  if (existing) return existing as Friendship;
  
  const stmt = db.prepare(`
    INSERT INTO friendships (user_id_1, user_id_2) VALUES (?, ?)
  `);
  const result = stmt.run(smallerId, largerId);
  
  return {
    id: result.lastInsertRowid as number,
    user_id_1: smallerId,
    user_id_2: largerId
  };
}

// Delete friendship (unlink users)
export function deleteFriendship(userId1: string, userId2: string): boolean {
  const [smallerId, largerId] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
  
  const stmt = db.prepare(`
    DELETE FROM friendships 
    WHERE user_id_1 = ? AND user_id_2 = ?
  `);
  const result = stmt.run(smallerId, largerId);
  
  return result.changes > 0;
}

// Get graph data (users and friendships)
export function getGraphData() {
  const users = getAllUsers();
  const friendships = getAllFriendships();
  
  return {
    users,
    edges: friendships.map(f => ({
      id: `${f.user_id_1}-${f.user_id_2}`,
      source: f.user_id_1,
      target: f.user_id_2
    }))
  };
}

export default db;