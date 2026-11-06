import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { isCollegeEmail } from '../src/utils/validation';

const prisma = new PrismaClient();

async function main() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_ROLL_NUMBER } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_ROLL_NUMBER) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_ROLL_NUMBER before provisioning an admin.');
  }
  if (!isCollegeEmail(ADMIN_EMAIL)) throw new Error('ADMIN_EMAIL must use an approved college email domain.');
  if (ADMIN_PASSWORD.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters long.');

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const rollNumber = ADMIN_ROLL_NUMBER.trim().toUpperCase();
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { rollNumber }] }, select: { email: true, rollNumber: true } });
  if (existing) throw new Error('An account already uses this admin email or roll number. Choose unused values; no account was changed.');

  const password = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = await prisma.user.create({
    data: {
      name: ADMIN_NAME.trim(), email, password, rollNumber,
      department: 'College Administration', semester: 1, role: 'ADMIN',
    },
    select: { id: true, name: true, email: true, role: true },
  });
  console.log(`Created administrator account ${admin.email} (${admin.id}).`);
}

main().catch((error) => {
  console.error('Admin provisioning failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
