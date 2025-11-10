import { describe, it, expect, beforeEach } from 'vitest';
import {
  initializeDatabase,
  createUser,
  deleteUser,
  createFriendship,
  deleteFriendship,
  getUserById,
  getAllUsers,
} from '@/lib/database';
import db from '@/lib/database';

// Mock the uuid function to return predictable IDs
vi.mock('uuid', () => ({
  v4: () => {
    if ((global as any).mockUuidCounter === undefined) {
      (global as any).mockUuidCounter = 0;
    }
    (global as any).mockUuidCounter++;
    return `mock-uuid-${(global as any).mockUuidCounter}`;
  },
}));

describe('Backend Business Logic', () => {
  beforeEach(() => {
    // Reset the database and counter before each test
    (global as any).mockUuidCounter = 0;
    initializeDatabase();
    
    // Clear all data from tables
    db.exec('DELETE FROM friendships');
    db.exec('DELETE FROM users');
  });

  it('should prevent deleting a user who has friends', () => {
    // 1. Create two users
    const userA = createUser('User A', 30, []);
    const userB = createUser('User B', 25, []);

    // 2. Create a friendship between them
    createFriendship(userA.id, userB.id);

    // 3. Attempt to delete User A
    const result = deleteUser(userA.id);

    // 4. Assert that the deletion failed
    expect(result.success).toBe(false);
    expect(result.error).toContain('Cannot delete user with existing friendships');

    // 5. Assert that the user still exists
    const stillExists = getUserById(userA.id);
    expect(stillExists).not.toBeNull();
  });

  it('should correctly calculate the popularity score', () => {
    // 1. Create users
    const userA = createUser('User A', 30, ['Reading', 'Gaming', 'Coding']);
    const userB = createUser('User B', 25, ['Gaming', 'Music']);
    const userC = createUser('User C', 35, ['Reading', 'Yoga']);
    const userD = createUser('User D', 40, ['Traveling']);

    // 2. Create friendships for User A
    createFriendship(userA.id, userB.id); // 1 shared hobby (Gaming)
    createFriendship(userA.id, userC.id); // 1 shared hobby (Reading)
    createFriendship(userA.id, userD.id); // 0 shared hobbies

    // 3. Fetch User A and check the score
    const updatedUserA = getUserById(userA.id);
    
    // Expected score: 3 friends + (2 shared hobbies * 0.5) = 3 + 1 = 4
    expect(updatedUserA?.popularityScore).toBe(4);

    // 4. Check another user's score
    const updatedUserB = getUserById(userB.id);
    // Expected score: 1 friend + (1 shared hobby * 0.5) = 1 + 0.5 = 1.5
    expect(updatedUserB?.popularityScore).toBe(1.5);
  });

  it('should allow deleting a user after unlinking them', () => {
    // 1. Create two users and link them
    const userA = createUser('User A', 30, []);
    const userB = createUser('User B', 25, []);
    createFriendship(userA.id, userB.id);

    // 2. Unlink the users
    const unlinkSuccess = deleteFriendship(userA.id, userB.id);
    expect(unlinkSuccess).toBe(true);

    // 3. Attempt to delete User A again
    const deleteResult = deleteUser(userA.id);

    // 4. Assert that the deletion was successful
    expect(deleteResult.success).toBe(true);
    expect(deleteResult.error).toBeUndefined();

    // 5. Assert that the user no longer exists
    const shouldBeNull = getUserById(userA.id);
    expect(shouldBeNull).toBeNull();
  });

  it('should treat friendships as one mutual connection', () => {
    const userA = createUser('User A', 30, []);
    const userB = createUser('User B', 25, []);

    // Create link A -> B
    createFriendship(userA.id, userB.id);
    let allUsers = getAllUsers();
    let userA_data = allUsers.find(u => u.id === userA.id);
    expect(userA_data?.friends.length).toBe(1);

    // Attempt to create link B -> A
    createFriendship(userB.id, userA.id);
    allUsers = getAllUsers();
    userA_data = allUsers.find(u => u.id === userA.id);
    // Friend count should still be 1
    expect(userA_data?.friends.length).toBe(1);
  });
});
