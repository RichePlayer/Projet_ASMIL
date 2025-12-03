const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing getAllInvoices query...');
        const invoices = await prisma.invoice.findMany({
            take: 10,
            orderBy: { created_at: 'desc' },
            include: {
                enrollment: {
                    include: {
                        student: true,
                        session: {
                            include: {
                                module: {
                                    include: {
                                        formation: true
                                    }
                                }
                            }
                        }
                    }
                },
                payments: true
            }
        });
        console.log('Query successful!');
        console.log('Invoices found:', invoices.length);
        console.log(JSON.stringify(invoices[0], null, 2));
    } catch (error) {
        console.error('Error executing query:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
