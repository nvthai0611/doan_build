import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function restoreData(backupFilePath?: string) {
  try {
    console.log('🔄 Starting restore...');

    // Tìm file backup
    let filepath: string;
    
    if (backupFilePath) {
      filepath = backupFilePath;
    } else {
      // Tự động tìm backup mới nhất
      const backupDir = path.join(__dirname, '..', 'backups');
      const files = fs.readdirSync(backupDir)
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse();
      
      if (files.length === 0) {
        throw new Error('Không tìm thấy file backup nào!');
      }
      
      filepath = path.join(backupDir, files[0]);
    }

    console.log(`📂 Reading backup from: ${filepath}`);
    
    const backupContent = fs.readFileSync(filepath, 'utf-8');
    const backup = JSON.parse(backupContent);

    console.log(`📅 Backup timestamp: ${backup.timestamp}`);
    console.log(`📊 Tables to restore: ${Object.keys(backup.data).length}`);

    console.log('\n🔄 Restoring data...\n');
    console.log('⚠️  Note: Restoring in correct order to respect foreign key constraints');

    // Step 1: Restore core data first (roles, schools, etc.)
    if (backup.data.roles && backup.data.roles.length > 0) {
      console.log(`  → Restoring ${backup.data.roles.length} roles...`);
      for (const role of backup.data.roles) {
        await prisma.role.upsert({
          where: { id: role.id },
          create: {
            ...role,
            createdAt: new Date(role.createdAt),
            updatedAt: new Date(role.updatedAt),
          },
          update: {}
        });
      }
      console.log(`  ✅ Roles restored`);
    }

    if (backup.data.permissions && backup.data.permissions.length > 0) {
      console.log(`  → Restoring ${backup.data.permissions.length} permissions...`);
      for (const permission of backup.data.permissions) {
        await prisma.permission.upsert({
          where: { id: permission.id },
          create: {
            ...permission,
            createdAt: new Date(permission.createdAt),
            updatedAt: new Date(permission.updatedAt),
          },
          update: {}
        });
      }
      console.log(`  ✅ Permissions restored`);
    }

    if (backup.data.rolePermissions && backup.data.rolePermissions.length > 0) {
      console.log(`  → Restoring ${backup.data.rolePermissions.length} role permissions...`);
      for (const rp of backup.data.rolePermissions) {
        await prisma.rolePermission.upsert({
          where: { 
            roleId_permissionId: {
              roleId: rp.roleId,
              permissionId: rp.permissionId
            }
          },
          create: {
            ...rp,
            createdAt: new Date(rp.createdAt),
          },
          update: {}
        });
      }
      console.log(`  ✅ Role permissions restored`);
    }

    if (backup.data.schools && backup.data.schools.length > 0) {
      console.log(`  → Restoring ${backup.data.schools.length} schools...`);
      for (const school of backup.data.schools) {
        await prisma.school.upsert({
          where: { id: school.id },
          create: {
            ...school,
            createdAt: new Date(school.createdAt),
            updatedAt: new Date(school.updatedAt),
          },
          update: {}
        });
      }
      console.log(`  ✅ Schools restored`);
    }

    if (backup.data.subjects && backup.data.subjects.length > 0) {
      console.log(`  → Restoring ${backup.data.subjects.length} subjects...`);
      for (const subject of backup.data.subjects) {
        await prisma.subject.upsert({
          where: { id: subject.id },
          create: subject,
          update: {}
        });
      }
      console.log(`  ✅ Subjects restored`);
    }

    if (backup.data.grades && backup.data.grades.length > 0) {
      console.log(`  → Restoring ${backup.data.grades.length} grades...`);
      for (const grade of backup.data.grades) {
        await prisma.grade.upsert({
          where: { id: grade.id },
          create: {
            ...grade,
            createdAt: new Date(grade.createdAt),
          },
          update: {}
        });
      }
      console.log(`  ✅ Grades restored`);
    }

    if (backup.data.rooms && backup.data.rooms.length > 0) {
      console.log(`  → Restoring ${backup.data.rooms.length} rooms...`);
      for (const room of backup.data.rooms) {
        await prisma.room.upsert({
          where: { id: room.id },
          create: {
            ...room,
            createdAt: new Date(room.createdAt),
          },
          update: {}
        });
      }
      console.log(`  ✅ Rooms restored`);
    }

    // Step 2: Restore users (now roles exist)
    if (backup.data.users && backup.data.users.length > 0) {
      console.log(`  → Restoring ${backup.data.users.length} users...`);
      for (const user of backup.data.users) {
        await prisma.user.upsert({
          where: { id: user.id },
          create: {
            ...user,
            birthDate: user.birthDate ? new Date(user.birthDate) : null,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
          },
          update: {}
        });
      }
      console.log(`  ✅ Users restored`);
    }

    // Restore parents
    if (backup.data.parents && backup.data.parents.length > 0) {
      console.log(`  → Restoring ${backup.data.parents.length} parents...`);
      for (const parent of backup.data.parents) {
        await prisma.parent.upsert({
          where: { id: parent.id },
          create: {
            ...parent,
            createdAt: new Date(parent.createdAt),
            updatedAt: new Date(parent.updatedAt),
          },
          update: {}
        });
      }
      console.log(`  ✅ Parents restored`);
    }

    // Restore students
    if (backup.data.students && backup.data.students.length > 0) {
      console.log(`  → Restoring ${backup.data.students.length} students...`);
      for (const student of backup.data.students) {
        await prisma.student.upsert({
          where: { id: student.id },
          create: {
            ...student,
            createdAt: new Date(student.createdAt),
            updatedAt: new Date(student.updatedAt),
          },
          update: {}
        });
      }
      console.log(`  ✅ Students restored`);
    }

    // Restore teachers
    if (backup.data.teachers && backup.data.teachers.length > 0) {
      console.log(`  → Restoring ${backup.data.teachers.length} teachers...`);
      for (const teacher of backup.data.teachers) {
        await prisma.teacher.upsert({
          where: { id: teacher.id },
          create: {
            ...teacher,
            createdAt: new Date(teacher.createdAt),
            updatedAt: new Date(teacher.updatedAt),
          },
          update: {}
        });
      }
      console.log(`  ✅ Teachers restored`);
    }

    // Restore classes
    if (backup.data.classes && backup.data.classes.length > 0) {
      console.log(`  → Restoring ${backup.data.classes.length} classes...`);
      for (const classItem of backup.data.classes) {
        await prisma.class.upsert({
          where: { id: classItem.id },
          create: {
            ...classItem,
            expectedStartDate: classItem.expectedStartDate ? new Date(classItem.expectedStartDate) : null,
            actualStartDate: classItem.actualStartDate ? new Date(classItem.actualStartDate) : null,
            actualEndDate: classItem.actualEndDate ? new Date(classItem.actualEndDate) : null,
            feeLockedAt: classItem.feeLockedAt ? new Date(classItem.feeLockedAt) : null,
            createdAt: new Date(classItem.createdAt),
            updatedAt: new Date(classItem.updatedAt),
          },
          update: {}
        });
      }
      console.log(`  ✅ Classes restored`);
    }

    // Restore enrollments
    if (backup.data.enrollments && backup.data.enrollments.length > 0) {
      console.log(`  → Restoring ${backup.data.enrollments.length} enrollments...`);
      for (const enrollment of backup.data.enrollments) {
        await prisma.enrollment.upsert({
          where: { id: enrollment.id },
          create: {
            ...enrollment,
            enrolledAt: new Date(enrollment.enrolledAt),
            completedAt: enrollment.completedAt ? new Date(enrollment.completedAt) : null,
          },
          update: {}
        });
      }
      console.log(`  ✅ Enrollments restored`);
    }

    console.log('\n✅ Restore completed successfully!');
    console.log(`📊 Restored data from: ${backup.timestamp}`);

  } catch (error) {
    console.error('❌ Error during restore:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
const args = process.argv.slice(2);
const backupFile = args[0]; // Có thể truyền path file backup: npx ts-node scripts/restore-data.ts path/to/backup.json

restoreData(backupFile).catch(console.error);

