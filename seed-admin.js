/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai pembuatan akun Admin...");
  const adminPassword = await bcrypt.hash('Asep12345', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lms.local' },
    update: {
      password_hash: adminPassword
    },
    create: {
      email: 'admin@lms.local',
      name: 'Admin ArenHost',
      password_hash: adminPassword,
      role: 'Admin',
    },
  });
  
  console.log("AKUN BERHASIL DIBUAT/DIPERBARUI:");
  console.log("Email: " + admin.email);
  console.log("Password: Asep12345");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Terjadi error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
