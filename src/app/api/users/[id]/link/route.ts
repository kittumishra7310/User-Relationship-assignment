import { NextRequest, NextResponse } from 'next/server';
import { createFriendship } from '@/lib/database';

// POST /api/users/:id/link - Create friendship between users
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId1 } = await params;

    if (!userId1) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { targetUserId: userId2 } = body;

    if (!userId2 || typeof userId2 !== 'string') {
      return NextResponse.json(
        { error: 'Valid targetUserId is required' },
        { status: 400 }
      );
    }

    if (userId1 === userId2) {
      return NextResponse.json(
        { error: 'Cannot link user to themselves' },
        { status: 400 }
      );
    }

    const friendship = createFriendship(userId1, userId2);

    if (!friendship) {
      return NextResponse.json(
        { error: 'Failed to create friendship. One or both users may not exist.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Users linked successfully', friendship },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error linking users:', error);
    return NextResponse.json(
      { error: 'Failed to link users' },
      { status: 500 }
    );
  }
}
