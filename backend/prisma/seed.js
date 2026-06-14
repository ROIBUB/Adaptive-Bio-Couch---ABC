const prisma = require('./prismaClient');

async function main() {

}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });