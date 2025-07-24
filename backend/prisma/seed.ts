import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const resources = [
    {
      name: 'Conference Room A',
      description: 'Large conference room with projector and whiteboard (capacity: 12)'
    },
    {
      name: 'Conference Room B',
      description: 'Medium meeting room with video conferencing setup (capacity: 8)'
    },
    {
      name: 'Conference Room C',
      description: 'Medium meeting room with video conferencing setup (capacity: 15)'
    },
    {
      name: 'Conference Room D',
      description: 'Medium meeting room with video conferencing setup (capacity: 50)'
    },
    {
      name: 'Conference Room E',
      description: 'Medium meeting room with video conferencing setup (capacity: 20)'
    }
  ];

  for (const resource of resources) {
    await prisma.resource.upsert({
      where: { name: resource.name },
      update: {},
      create: resource
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
