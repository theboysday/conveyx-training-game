
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, score, actions, endTime } = body;

    const session = await prisma.gameSession.update({
      where: { id: params.id },
      data: {
        status,
        score,
        actions,
        endTime: endTime ? new Date(endTime) : undefined,
      },
      include: {
        scenario: true,
      },
    });

    // Update user progress if session is completed
    if (status === 'completed' && session.userId) {
      await updateUserProgress(session.userId, score);
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error updating game session:', error);
    return NextResponse.json(
      { error: 'Failed to update game session' },
      { status: 500 }
    );
  }
}

async function updateUserProgress(userId: string, score: number) {
  const existingProgress = await prisma.userProgress.findUnique({
    where: { userId },
  });

  if (existingProgress) {
    const newTotalSessions = existingProgress.totalSessions + 1;
    const newCompletedSessions = existingProgress.completedSessions + 1;
    const newAverageScore = (
      (existingProgress.averageScore * existingProgress.completedSessions + score) /
      newCompletedSessions
    );

    await prisma.userProgress.update({
      where: { userId },
      data: {
        totalSessions: newTotalSessions,
        completedSessions: newCompletedSessions,
        averageScore: newAverageScore,
        bestScore: Math.max(existingProgress.bestScore, score),
        lastPlayed: new Date(),
      },
    });
  } else {
    await prisma.userProgress.create({
      data: {
        userId,
        totalSessions: 1,
        completedSessions: 1,
        averageScore: score,
        bestScore: score,
        lastPlayed: new Date(),
      },
    });
  }
}
