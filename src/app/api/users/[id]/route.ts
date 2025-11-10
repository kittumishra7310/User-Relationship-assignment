import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser } from '@/lib/database';

// GET /api/users/:id - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const user = getUserById(id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/:id - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { username, age, hobbies } = body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json(
        { error: 'Username is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!age || typeof age !== 'number' || age < 1 || age > 150) {
      return NextResponse.json(
        { error: 'Age is required and must be a valid number between 1 and 150' },
        { status: 400 }
      );
    }

    if (!Array.isArray(hobbies)) {
      return NextResponse.json(
        { error: 'Hobbies must be an array' },
        { status: 400 }
      );
    }

    const user = updateUser(id, username.trim(), age, hobbies);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/:id - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const result = deleteUser(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete user' },
        { status: result.error?.includes('friendships') ? 409 : 404 }
      );
    }

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}