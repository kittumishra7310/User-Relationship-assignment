import { NextResponse } from 'next/server';
import { getGraphData } from '@/lib/database';

// GET /api/graph - Get full graph data (users + edges)
export async function GET() {
  try {
    const graphData = getGraphData();
    return NextResponse.json(graphData, { status: 200 });
  } catch (error) {
    console.error('Error fetching graph data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch graph data' },
      { status: 500 }
    );
  }
}
