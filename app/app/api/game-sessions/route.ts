
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenarioId, userId } = body;

    // Create a new game session
    const session = await prisma.gameSession.create({
      data: {
        scenarioId,
        userId,
        status: 'active',
        startTime: new Date(),
      },
      include: {
        scenario: true,
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating game session:', error);
    return NextResponse.json(
      { error: 'Failed to create game session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    const sessions = await prisma.gameSession.findMany({
      where: userId ? { userId } : {},
      include: {
        scenario: true,
      },
      orderBy: {
        startTime: 'desc',
      },
      take: limit,
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching game sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game sessions' },
      { status: 500 }
    );
  }
}
