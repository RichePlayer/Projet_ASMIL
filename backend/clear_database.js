const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDatabase() {
    try {
        console.log('Clearing database...');

        // Delete in order to respect foreign key constraints
        await prisma.payment.deleteMany({});
        await prisma.invoice.deleteMany({});
        await prisma.grade.deleteMany({});
        await prisma.attendance.deleteMany({});
        await prisma.enrollment.deleteMany({});
        await prisma.certificate.deleteMany({});
        await prisma.session.deleteMany({});
        await prisma.student.deleteMany({});
        await prisma.teacher.deleteMany({});
        await prisma.module.deleteMany({});
        await prisma.formation.deleteMany({});
        await prisma.announcement.deleteMany({});
        await prisma.user.deleteMany({});

        console.log('✓ Database cleared successfully');

    } catch (error) {
        console.error('Error clearing database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

clearDatabase();
