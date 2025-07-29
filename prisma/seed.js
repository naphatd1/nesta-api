"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const argon2 = require("argon2");
const prisma = new client_1.PrismaClient();
async function main() {
    const adminPassword = await argon2.hash('admin123');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            password: adminPassword,
            name: 'Admin User',
            role: client_1.UserRole.ADMIN,
        },
    });
    const userPassword = await argon2.hash('user123');
    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            password: userPassword,
            name: 'Regular User',
            role: client_1.UserRole.USER,
        },
    });
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
//# sourceMappingURL=seed.js.map