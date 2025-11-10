import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

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

// Initialize database schema
export async function initializeDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        age INTEGER NOT NULL,
        hobbies JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create friendships table
    await sql`
      CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        user_id_1 TEXT NOT NULL,
        user_id_2 TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id_1, user_id_2)
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_friendships_user_1 ON friendships(user_id_1)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_friendships_user_2 ON friendships(user_id_2)`;

    // Seed default users if empty
    const { rows } = await sql`SELECT COUNT(*) as count FROM users`;
    if (rows[0].count === '0') {
      console.log('Seeding database with default users...');
      
      const user1Id = 'default-user-1';
      const user2Id = 'default-user-2';
      const user3Id = 'default-user-3';
      
      await sql`INSERT INTO users (id, username, age, hobbies) VALUES 
        (${user1Id}, 'Alice', 28, ${JSON.stringify(['Reading', 'Gaming', 'Coding'])}),
        (${user2Id}, 'Bob', 32, ${JSON.stringify(['Gaming', 'Cooking', 'Music'])}),
        (${user3Id}, 'Charlie', 25, ${JSON.stringify(['Reading', 'Music', 'Yoga'])})`;
      
      await sql`INSERT INTO friendships (user_id_1, user_id_2) VALUES 
        (${user1Id}, ${user2Id}),
        (${user1Id}, ${user3Id})`;
      
      console.log('Database seeded successfully');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Calculate popularity score
function calculatePopularityScore(userId: string, hobbies: string[], allUsers: any[]): number {
  const user = allUsers.find(u => u.id === userId);
  if (!user) return 0;

  const friendIds = user.friends || [];
  const uniqueFriendsCount = friendIds.length;
  
  if (uniqueFriendsCount === 0) return 0;
  
  let totalSharedHobbies = 0;
  for (const friendId of friendIds) {
    const friend = allUsers.find(u => u.id === friendId);
    if (friend) {
      const friendHobbies = Array.isArray(friend.hobbies) ? friend.hobbies : JSON.parse(friend.hobbies);
      const sharedCount = hobbies.filter(hobby => friendHobbies.includes(hobby)).length;
      totalSharedHobbies += sharedCount;
    }
  }
  
  const score = uniqueFriendsCount + (totalSharedHobbies * 0.5);
  return Math.round(score * 10) / 10;
}

// Get user friendships
async function getUserFriendships(userId: string): Promise<string[]> {
  const { rows } = await sql`
    SELECT user_id_2 as friend_id FROM friendships WHERE user_id_1 = ${userId}
    UNION
    SELECT user_id_1 as friend_id FROM friendships WHERE user_id_2 = ${userId}
  `;
  return rows.map(row => row.friend_id);
}

// Get all users with popularity scores
export async function getAllUsers(): Promise<User[]> {
  const { rows } = await sql`SELECT id, username, age, hobbies, created_at FROM users`;
  
  // Get all friendships first
  const usersWithFriends = await Promise.all(
    rows.map(async (row) => ({
      ...row,
      friends: await getUserFriendships(row.id)
    }))
  );
  
  return usersWithFriends.map(row => {
    const hobbies = Array.isArray(row.hobbies) ? row.hobbies : JSON.parse(row.hobbies);
    return {
      id: row.id,
      username: row.username,
      age: row.age,
      hobbies,
      friends: row.friends,
      popularityScore: calculatePopularityScore(row.id, hobbies, usersWithFriends),
      createdAt: row.created_at
    };
  });
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  const { rows } = await sql`SELECT id, username, age, hobbies, created_at FROM users WHERE id = ${id}`;
  
  if (rows.length === 0) return null;
  
  const row = rows[0];
  const hobbies = Array.isArray(row.hobbies) ? row.hobbies : JSON.parse(row.hobbies);
  const friends = await getUserFriendships(row.id);
  
  // Get all users for score calculation
  const allUsers = await sql`SELECT id, username, age, hobbies, created_at FROM users`;
  const usersWithFriends = await Promise.all(
    allUsers.rows.map(async (u) => ({
      ...u,
      friends: await getUserFriendships(u.id)
    }))
  );
  
  return {
    id: row.id,
    username: row.username,
    age: row.age,
    hobbies,
    friends,
    popularityScore: calculatePopularityScore(row.id, hobbies, usersWithFriends),
    createdAt: row.created_at
  };
}

// Create a new user
export async function createUser(username: string, age: number, hobbies: string[] = []): Promise<User> {
  const id = uuidv4();
  await sql`INSERT INTO users (id, username, age, hobbies) VALUES (${id}, ${username}, ${age}, ${JSON.stringify(hobbies)})`;
  
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
export async function updateUser(id: string, username: string, age: number, hobbies: string[]): Promise<User | null> {
  const oldUser = await getUserById(id);
  if (!oldUser) return null;
  
  await sql`UPDATE users SET username = ${username}, age = ${age}, hobbies = ${JSON.stringify(hobbies)} WHERE id = ${id}`;
  
  return await getUserById(id);
}

// Delete user
export async function deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
  const friendships = await getUserFriendships(id);
  
  if (friendships.length > 0) {
    return {
      success: false,
      error: 'Cannot delete user with existing friendships. Please unlink all friends first.'
    };
  }
  
  const { rowCount } = await sql`DELETE FROM users WHERE id = ${id}`;
  
  if (rowCount === 0) {
    return { success: false, error: 'User not found' };
  }
  
  return { success: true };
}

// Get all friendships
export async function getAllFriendships(): Promise<Friendship[]> {
  const { rows } = await sql`SELECT id, user_id_1, user_id_2 FROM friendships`;
  return rows as Friendship[];
}

// Create friendship
export async function createFriendship(userId1: string, userId2: string): Promise<Friendship | null> {
  const [smallerId, largerId] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
  
  const user1 = await getUserById(smallerId);
  const user2 = await getUserById(largerId);
  
  if (!user1 || !user2) return null;
  
  try {
    const { rows } = await sql`
      INSERT INTO friendships (user_id_1, user_id_2) 
      VALUES (${smallerId}, ${largerId})
      ON CONFLICT (user_id_1, user_id_2) DO NOTHING
      RETURNING id, user_id_1, user_id_2
    `;
    
    if (rows.length === 0) {
      // Already exists
      const existing = await sql`SELECT id, user_id_1, user_id_2 FROM friendships WHERE user_id_1 = ${smallerId} AND user_id_2 = ${largerId}`;
      return existing.rows[0] as Friendship;
    }
    
    return rows[0] as Friendship;
  } catch (error) {
    console.error('Error creating friendship:', error);
    return null;
  }
}

// Delete friendship
export async function deleteFriendship(userId1: string, userId2: string): Promise<boolean> {
  const [smallerId, largerId] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
  
  const { rowCount } = await sql`DELETE FROM friendships WHERE user_id_1 = ${smallerId} AND user_id_2 = ${largerId}`;
  
  return rowCount > 0;
}

// Get graph data
export async function getGraphData() {
  const users = await getAllUsers();
  const friendships = await getAllFriendships();
  
  return {
    users,
    edges: friendships.map(f => ({
      id: `${f.user_id_1}-${f.user_id_2}`,
      source: f.user_id_1,
      target: f.user_id_2
    }))
  };
}
