const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('./utils/passwordUtils');

const prisma = new PrismaClient();

async function seedFull() {
    try {
        console.log('🌱 Starting full database seeding...\n');

        // 1. Create Users
        const adminHash = await hashPassword('admin123');
        const secretaryHash = await hashPassword('password');

        const admin = await prisma.user.upsert({
            where: { email: 'admin@asmil.mg' },
            update: {},
            create: {
                full_name: 'Administrateur',
                email: 'admin@asmil.mg',
                password_hash: adminHash,
                role: 'Admin',
                status: 'active'
            }
        });

        const secretary = await prisma.user.upsert({
            where: { email: 'secretaire@asmil.mg' },
            update: {},
            create: {
                full_name: 'Secrétaire Principale',
                email: 'secretaire@asmil.mg',
                password_hash: secretaryHash,
                role: 'Gestionnaire',
                status: 'active'
            }
        });

        console.log('✅ Users created');

        // 2. Create Teachers
        const teacher1 = await prisma.teacher.upsert({
            where: { registration_number: 'T001' },
            update: {},
            create: {
                registration_number: 'T001',
                first_name: 'Jean',
                last_name: 'Rakoto',
                email: 'jean.rakoto@asmil.mg',
                phone: '034 12 345 67',
                specialties: ['Bureautique', 'Word', 'Excel'],
                bio: 'Expert en bureautique avec 15 ans d\'expérience',
                status: 'actif',
                hourly_rate: 25000.00
            }
        });

        const teacher2 = await prisma.teacher.upsert({
            where: { registration_number: 'T002' },
            update: {},
            create: {
                registration_number: 'T002',
                first_name: 'Marie',
                last_name: 'Razafy',
                email: 'marie.razafy@asmil.mg',
                phone: '034 23 456 78',
                specialties: ['Informatique', 'Programmation', 'Web'],
                bio: 'Développeuse web passionnée',
                status: 'actif',
                hourly_rate: 30000.00
            }
        });

        console.log('✅ Teachers created');

        // 3. Create Formations
        const formationBureau = await prisma.formation.upsert({
            where: { id: 1 },
            update: {},
            create: {
                category: 'Bureautique',
                title: 'Formation Bureautique Complète',
                description: 'Maîtrisez Word, Excel et PowerPoint',
                duration_months: 3,
                tuition_fee: 150000.00,
                registration_fee: 25000.00,
                type: 'Présentiel',
                prerequisites: 'Aucun'
            }
        });

        console.log('✅ Formations created');

        // 4. Create Modules
        const moduleWord = await prisma.module.create({
            data: {
                formation_id: formationBureau.id,
                title: 'Word Avancé',
                description: 'Traitement de texte professionnel',
                hours: 40,
                order_index: 1
            }
        });

        const moduleExcel = await prisma.module.create({
            data: {
                formation_id: formationBureau.id,
                title: 'Excel Avancé',
                description: 'Tableur et formules avancées',
                hours: 50,
                order_index: 2
            }
        });

        console.log('✅ Modules created');

        // 5. Create Sessions
        const sessionWord = await prisma.session.create({
            data: {
                module_id: moduleWord.id,
                teacher_id: teacher1.id,
                start_date: new Date('2025-12-08'),
                end_date: new Date('2026-02-08'),
                room: 'Salle Bazar Bé',
                capacity: 20,
                status: 'planifiée',
                schedule: {
                    days: ['Lundi', 'Mercredi', 'Vendredi'],
                    time: '14:00-17:00'
                }
            }
        });

        const sessionExcel = await prisma.session.create({
            data: {
                module_id: moduleExcel.id,
                teacher_id: teacher1.id,
                start_date: new Date('2026-02-10'),
                end_date: new Date('2026-04-10'),
                room: 'Salle Analakely',
                capacity: 20,
                status: 'planifiée',
                schedule: {
                    days: ['Mardi', 'Jeudi'],
                    time: '09:00-12:00'
                }
            }
        });

        console.log('✅ Sessions created');

        // 6. Create Students
        const students = [];
        const studentNames = [
            { first: 'Andry', last: 'Rasolofo' },
            { first: 'Fara', last: 'Randria' },
            { first: 'Hery', last: 'Rakotobe' },
            { first: 'Nivo', last: 'Razafindra' },
            { first: 'Soa', last: 'Raharison' }
        ];

        for (let i = 0; i < studentNames.length; i++) {
            const student = await prisma.student.create({
                data: {
                    registration_number: `ETU${String(i + 1).padStart(4, '0')}`,
                    first_name: studentNames[i].first,
                    last_name: studentNames[i].last,
                    date_of_birth: new Date(2000 + i, i, 15),
                    gender: i % 2 === 0 ? 'Masculin' : 'Féminin',
                    email: `${studentNames[i].first.toLowerCase()}.${studentNames[i].last.toLowerCase()}@gmail.com`,
                    phone_parent: `034 ${10 + i}0 000 ${10 + i}`,
                    address: `Lot ${i + 1} Antananarivo`,
                    status: 'actif'
                }
            });
            students.push(student);
        }

        console.log('✅ Students created');

        // 7. Create Enrollments for Word session
        for (const student of students) {
            const totalAmount = parseFloat(formationBureau.tuition_fee) + parseFloat(formationBureau.registration_fee);
            const invoiceNumber = `INV-${Date.now()}-${student.id}`;

            await prisma.enrollment.create({
                data: {
                    student_id: student.id,
                    session_id: sessionWord.id,
                    status: 'actif',
                    enrollment_date: new Date(),
                    total_amount: totalAmount,
                    paid_amount: 0,
                    notes: 'Inscription initiale',
                    invoices: {
                        create: {
                            invoice_number: invoiceNumber,
                            amount: totalAmount,
                            status: 'impayée',
                            due_date: new Date(new Date().setDate(new Date().getDate() + 30)),
                            notes: 'Facture générée automatiquement'
                        }
                    }
                }
            });
        }

        console.log('✅ Enrollments created');

        console.log('\n🎉 Seeding completed successfully!\n');
        console.log('📊 Database summary:');
        console.log(`   - ${2} Users`);
        console.log(`   - ${2} Teachers`);
        console.log(`   - ${1} Formation`);
        console.log(`   - ${2} Modules`);
        console.log(`   - ${2} Sessions`);
        console.log(`   - ${students.length} Students`);
        console.log(`   - ${students.length} Enrollments\n`);
        console.log('🔐 Login credentials:');
        console.log('   Admin: admin@asmil.mg / admin123');
        console.log('   Secrétaire: secretaire@asmil.mg / password\n');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedFull();
