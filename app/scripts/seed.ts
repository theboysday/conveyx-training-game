
import { PrismaClient } from '@prisma/client';
import { defaultScenarios } from '../lib/scenarios';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.gameSession.deleteMany();
    await prisma.gameScenario.deleteMany();
    await prisma.userProgress.deleteMany();
    await prisma.systemSettings.deleteMany();

    // Seed game scenarios
    console.log('🎮 Seeding game scenarios...');
    for (const scenario of defaultScenarios) {
      await prisma.gameScenario.create({
        data: {
          id: scenario.id,
          name: scenario.name,
          description: scenario.description || '',
          difficulty: scenario.difficulty,
          faultPanels: scenario.faultPanels,
          successConditions: scenario.successConditions,
          timeLimit: scenario.successConditions.timeLimit,
        },
      });
      console.log(`✅ Created scenario: ${scenario.name}`);
    }

    // Seed system settings
    console.log('⚙️  Seeding system settings...');
    await prisma.systemSettings.create({
      data: {
        key: 'game_config',
        value: {
          maxConcurrentUsers: 10,
          sessionTimeoutMinutes: 30,
          scoreMultipliers: {
            beginner: 1.0,
            intermediate: 1.5,
            advanced: 2.0,
          },
          penaltySettings: {
            timeOverLimitPenalty: 50,
            extraActionPenalty: 5,
            incorrectActionPenalty: 10,
          },
        },
      },
    });

    await prisma.systemSettings.create({
      data: {
        key: 'ui_settings',
        value: {
          animationSpeed: 'normal',
          autoSaveProgress: true,
          showAdvancedStats: false,
          enableSounds: true,
        },
      },
    });

    console.log('✅ System settings configured');

    // Create some sample user progress records for testing
    console.log('👤 Creating sample user progress...');
    const sampleUsers = [
      { userId: 'demo-user-1', completedSessions: 5, averageScore: 850 },
      { userId: 'demo-user-2', completedSessions: 12, averageScore: 920 },
      { userId: 'demo-user-3', completedSessions: 8, averageScore: 780 },
    ];

    for (const user of sampleUsers) {
      await prisma.userProgress.create({
        data: {
          userId: user.userId,
          totalSessions: user.completedSessions + 2,
          completedSessions: user.completedSessions,
          averageScore: user.averageScore,
          bestScore: Math.floor(user.averageScore * 1.2),
          lastPlayed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last week
        },
      });
      console.log(`✅ Created progress for: ${user.userId}`);
    }

    console.log('🎉 Database seed completed successfully!');
    console.log(`📊 Created:`);
    console.log(`   • ${defaultScenarios.length} game scenarios`);
    console.log(`   • 2 system configuration entries`);
    console.log(`   • ${sampleUsers.length} sample user progress records`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
