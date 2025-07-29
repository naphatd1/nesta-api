import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await argon2.hash('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });

  // Create regular user
  const userPassword = await argon2.hash('user123');
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Regular User',
      role: UserRole.USER,
    },
  });

  // Create sample posts
  await prisma.post.createMany({
    data: [
      {
        title: 'Welcome to our API',
        content: 'This is a sample post created by admin',
        published: true,
        authorId: admin.id,
      },
      {
        title: 'Getting Started',
        content: 'This is another sample post',
        published: true,
        authorId: user.id,
      },
      {
        title: 'Draft Post',
        content: 'This is a draft post',
        published: false,
        authorId: user.id,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin: admin@example.com / admin123');
  console.log('👤 User: user@example.com / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });