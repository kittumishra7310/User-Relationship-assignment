import { NextRequest, NextResponse } from 'next/server';
import { deleteFriendship } from '@/lib/db';

// DELETE /api/users/:id/unlink - Delete friendship between users
export async function DELETE(
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

    const success = await deleteFriendship(userId1, userId2);

    if (!success) {
      return NextResponse.json(
        { error: 'Friendship not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Users unlinked successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error unlinking users:', error);
    return NextResponse.json(
      { error: 'Failed to unlink users' },
      { status: 500 }
    );
  }
}
