import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function backupData() {
  console.log('🔄 Starting backup...');
  
  const backup = {
    timestamp: new Date().toISOString(),
    data: {
      users: await prisma.user.findMany(),
      teachers: await prisma.teacher.findMany(),
      students: await prisma.student.findMany(),
      parents: await prisma.parent.findMany(),
      classes: await prisma.class.findMany(),
      enrollments: await prisma.enrollment.findMany(),
      // Add more tables as needed
    }
  };

  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const filename = `backup-${new Date().toISOString().replace(/:/g, '-')}.json`;
  const filepath = path.join(backupDir, filename);
  
  // Custom replacer to handle BigInt
  const jsonString = JSON.stringify(backup, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2);
  
  fs.writeFileSync(filepath, jsonString);
  
  console.log(`✅ Backup completed: ${filepath}`);
  console.log(`📊 Backed up ${Object.keys(backup.data).length} tables`);
  
  await prisma.$disconnect();
}

backupData().catch(console.error);

