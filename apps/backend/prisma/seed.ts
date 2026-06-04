import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const deck = await prisma.deck.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Fibonacci',
      cards: {
        create: [
          { value: '0' },
          { value: '1' },
          { value: '2' },
          { value: '3' },
          { value: '5' },
          { value: '8' },
          { value: '13' },
          { value: '21' },
          { value: '40' },
          { value: '?' },
        ],
      },
    },
  });

  console.log(`Seeded deck: ${deck.name}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
