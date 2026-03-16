import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      name: '管理员',
      role: 'admin'
    }
  });
  
  console.log('Admin user created:', admin);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
