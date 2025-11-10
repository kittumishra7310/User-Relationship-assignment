import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser } from '@/lib/database';

// GET /api/users - Get all users
export async function GET() {
  try {
    const users = getAllUsers();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, age, hobbies = [] } = body;

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

    const user = createUser(username.trim(), age, hobbies);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}