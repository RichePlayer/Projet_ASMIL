const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    try {
        const modulesCount = await prisma.module.count();
        const teachersCount = await prisma.teacher.count();
        const formationsCount = await prisma.formation.count();

        console.log(`Modules count: ${modulesCount}`);
        console.log(`Teachers count: ${teachersCount}`);
        console.log(`Formations count: ${formationsCount}`);

        if (modulesCount > 0) {
            const modules = await prisma.module.findMany({ take: 5 });
            console.log('Sample Modules:', JSON.stringify(modules, null, 2));
        }

        if (teachersCount > 0) {
            const teachers = await prisma.teacher.findMany({ take: 5 });
            console.log('Sample Teachers:', JSON.stringify(teachers, null, 2));
        }

    } catch (error) {
        console.error('Error checking data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
