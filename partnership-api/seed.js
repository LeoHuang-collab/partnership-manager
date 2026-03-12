import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

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
  
  console.log('Admin user created/updated:');
  console.log('- Username: admin');
  console.log('- Password: admin123');
  console.log('- Name: 管理员');
  console.log('- Role: admin');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
