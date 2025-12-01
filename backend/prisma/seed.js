require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../utils/passwordUtils');

const prisma = new PrismaClient({});

async function main() {
    console.log('Start seeding...');

    // 1. Admin User
    const adminEmail = 'admin@asmil.mg';
    const adminPassword = 'admin123';
    const adminHash = await hashPassword(adminPassword);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            full_name: 'Administrateur',
            email: adminEmail,
            password_hash: adminHash,
            role: 'Admin',
            status: 'active',
            last_login: new Date(),
        },
    });
    console.log(`Created/Updated Admin: ${admin.email} (Password: ${adminPassword})`);

    // 2. Secretary User
    const secretaryEmail = 'secretaire@asmil.mg';
    const secretaryPassword = 'password';
    const secretaryHash = await hashPassword(secretaryPassword);

    const secretary = await prisma.user.upsert({
        where: { email: secretaryEmail },
        update: {},
        create: {
            full_name: 'Secrétaire Principale',
            email: secretaryEmail,
            password_hash: secretaryHash,
            role: 'Gestionnaire',
            status: 'active',
            last_login: new Date(),
        },
    });
    console.log(`Created/Updated Secretary: ${secretary.email} (Password: ${secretaryPassword})`);

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
