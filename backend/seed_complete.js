const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedComplete() {
    try {
        console.log('Starting complete database seeding...');

        // Create Users (Admin and Gestionnaire)
        const hashedPassword = await bcrypt.hash('password123', 10);

        const admin = await prisma.user.create({
            data: {
                full_name: 'Admin Principal',
                email: 'admin@asmil.com',
                password_hash: hashedPassword,
                role: 'Admin',
                status: 'active'
            }
        });

        const gestionnaire = await prisma.user.create({
            data: {
                full_name: 'Gestionnaire Principal',
                email: 'gestionnaire@asmil.com',
                password_hash: hashedPassword,
                role: 'Gestionnaire',
                status: 'active'
            }
        });

        console.log('✓ Users created (admin@asmil.com / gestionnaire@asmil.com - password: password123)');

        // Create Teachers
        const teacher1 = await prisma.teacher.create({
            data: {
                registration_number: 'T001',
                first_name: 'Jean',
                last_name: 'Dupont',
                email: 'jean.dupont@example.com',
                phone: '034 00 000 01',
                specialties: ['JavaScript', 'React', 'Node.js'],
                bio: 'Développeur fullstack avec 10 ans d\'expérience.',
                status: 'actif',
                hourly_rate: 50.00
            }
        });

        const teacher2 = await prisma.teacher.create({
            data: {
                registration_number: 'T002',
                first_name: 'Marie',
                last_name: 'Curie',
                email: 'marie.curie@example.com',
                phone: '034 00 000 02',
                specialties: ['UI Design', 'Figma', 'UX Research'],
                bio: 'Designer UX/UI passionnée par l\'expérience utilisateur.',
                status: 'actif',
                hourly_rate: 60.00
            }
        });

        console.log('✓ Teachers created');

        // Create Formations
        const formationWeb = await prisma.formation.create({
            data: {
                category: 'Développement',
                title: 'Développement Web Fullstack',
                description: 'Formation complète pour devenir développeur web fullstack. Apprenez HTML, CSS, JavaScript, React et Node.js.',
                duration_months: 6,
                price: 2500.00,
                type: 'Présentiel',
                prerequisites: 'Connaissances de base en informatique'
            }
        });

        const formationDesign = await prisma.formation.create({
            data: {
                category: 'Design',
                title: 'UI/UX Design Professionnel',
                description: 'Apprenez à concevoir des interfaces utilisateur modernes et intuitives avec Figma et les principes UX.',
                duration_months: 3,
                price: 1500.00,
                type: 'En ligne',
                prerequisites: 'Aucun prérequis'
            }
        });

        console.log('✓ Formations created');

        // Create Modules
        const module1 = await prisma.module.create({
            data: {
                formation_id: formationWeb.id,
                title: 'HTML/CSS & JavaScript',
                description: 'Les bases du développement web : HTML5, CSS3 et JavaScript ES6+',
                hours: 40,
                order_index: 1
            }
        });

        const module2 = await prisma.module.create({
            data: {
                formation_id: formationWeb.id,
                title: 'React & Node.js',
                description: 'Développement d\'applications web modernes avec React et Node.js',
                hours: 60,
                order_index: 2
            }
        });

        const module3 = await prisma.module.create({
            data: {
                formation_id: formationDesign.id,
                title: 'Figma & Prototypage',
                description: 'Maîtriser Figma pour créer des maquettes et prototypes interactifs',
                hours: 30,
                order_index: 1
            }
        });

        const module4 = await prisma.module.create({
            data: {
                formation_id: formationDesign.id,
                title: 'Design System & Composants',
                description: 'Créer un système de design cohérent et réutilisable',
                hours: 20,
                order_index: 2
            }
        });

        console.log('✓ Modules created');

        console.log('\n=== Seeding completed successfully! ===');
        console.log('\nLogin credentials:');
        console.log('Admin: admin@asmil.com / password123');
        console.log('Gestionnaire: gestionnaire@asmil.com / password123');
        console.log('\nDatabase summary:');
        console.log('- 2 Users (Admin, Gestionnaire)');
        console.log('- 2 Teachers');
        console.log('- 2 Formations');
        console.log('- 4 Modules');

    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedComplete();
