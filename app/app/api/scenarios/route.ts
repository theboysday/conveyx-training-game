
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const scenarios = await prisma.gameScenario.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(scenarios);
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scenarios' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, difficulty, faultPanels, successConditions, timeLimit } = body;

    const scenario = await prisma.gameScenario.create({
      data: {
        name,
        description,
        difficulty,
        faultPanels,
        successConditions,
        timeLimit,
      },
    });

    return NextResponse.json(scenario);
  } catch (error) {
    console.error('Error creating scenario:', error);
    return NextResponse.json(
      { error: 'Failed to create scenario' },
      { status: 500 }
    );
  }
}
