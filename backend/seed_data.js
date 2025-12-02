const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    try {
        console.log('Seeding database...');

        // Create Formations
        const formationWeb = await prisma.formation.create({
            data: {
                title: 'Développement Web Fullstack',
                description: 'Formation complète pour devenir développeur web.',
                duration_months: 6,
                price: 2500.00,
                type: 'Presentiel'
            }
        });

        const formationDesign = await prisma.formation.create({
            data: {
                title: 'UI/UX Design',
                description: 'Apprenez à concevoir des interfaces utilisateur modernes.',
                duration_months: 3,
                price: 1500.00,
                type: 'En ligne'
            }
        });

        console.log('Formations created.');

        // Create Modules
        await prisma.module.createMany({
            data: [
                {
                    formation_id: formationWeb.id,
                    title: 'HTML/CSS & JavaScript',
                    description: 'Les bases du web.',
                    hours: 40,
                    order_index: 1
                },
                {
                    formation_id: formationWeb.id,
                    title: 'React & Node.js',
                    description: 'Développement avancé.',
                    hours: 60,
                    order_index: 2
                },
                {
                    formation_id: formationDesign.id,
                    title: 'Figma & Prototypage',
                    description: 'Maîtriser Figma.',
                    hours: 30,
                    order_index: 1
                },
                {
                    formation_id: formationDesign.id,
                    title: 'Design System',
                    description: 'Créer un système de design cohérent.',
                    hours: 20,
                    order_index: 2
                }
            ]
        });

        console.log('Modules created.');

        // Create Teachers
        await prisma.teacher.createMany({
            data: [
                {
                    registration_number: 'T001',
                    first_name: 'Jean',
                    last_name: 'Dupont',
                    email: 'jean.dupont@example.com',
                    phone: '034 00 000 01',
                    specialties: ['JavaScript', 'React', 'Node.js'],
                    status: 'actif',
                    hourly_rate: 50.00
                },
                {
                    registration_number: 'T002',
                    first_name: 'Marie',
                    last_name: 'Curie',
                    email: 'marie.curie@example.com',
                    phone: '034 00 000 02',
                    specialties: ['UI Design', 'Figma', 'UX Research'],
                    status: 'actif',
                    hourly_rate: 60.00
                }
            ]
        });

        console.log('Teachers created.');
        console.log('Seeding completed successfully.');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
