import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Beta Access Codes
  const betaCode = 'PHY-LAUNCH';
  
  const existingCode = await prisma.accessCode.findUnique({
    where: { code: betaCode },
  });

  if (!existingCode) {
    await prisma.accessCode.create({
      data: {
        code: betaCode,
        maxUses: 200,
        uses: 0,
        isActive: true,
        // expiresAt: new Date('2026-05-01'), // Optional expiry
      },
    });
    console.log(`✅ Created Access Code: ${betaCode}`);
  } else {
    console.log(`ℹ️ Access Code ${betaCode} already exists.`);
  }

  // 2. Admin User (Optional - ensure admin exists if needed)
  // ...
  
  console.log('✅ Seeding completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
