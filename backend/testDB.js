const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
    try {
        console.log("⏳ Tentative de connexion…");
        await prisma.$connect();
        console.log("✅ Connexion PostgreSQL OK !");
        await prisma.$disconnect();
    } catch (err) {
        console.error("❌ Erreur de connexion :", err);
    }
}

test();
