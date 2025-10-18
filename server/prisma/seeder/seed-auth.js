const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu authentication...');

  // Tạo users mẫu
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Tạo Center Owner
  const centerOwner = await prisma.user.upsert({
    where: { email: 'owner@qne.edu.vn' },
    update: {},
    create: {
      email: 'owner@qne.edu.vn',
      password: hashedPassword,
      fullName: 'Phan Ngọc Ánh',
      username: 'center_owner',
      role: 'center_owner',
      phone: '0123456789',
      isActive: true,
    },
  });

  // Tạo Teacher
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@qne.edu.vn' },
    update: {},
    create: {
      email: 'teacher@qne.edu.vn',
      password: hashedPassword,
      fullName: 'Nguyễn Văn Giáo',
      username: 'teacher',
      role: 'teacher',
      phone: '0987654321',
      isActive: true,
      gender: 'MALE',
      birthDate: new Date('1990-05-15'),
    },
  });

  // Tạo Student
  const student = await prisma.user.upsert({
    where: { email: 'student@qne.edu.vn' },
    update: {},
    create: {
      email: 'student@qne.edu.vn',
      password: hashedPassword,
      fullName: 'Trần Văn Học',
      username: 'student',
      role: 'student',
      phone: '0369258147',
      isActive: true,
      gender: 'MALE',
      birthDate: new Date('2005-03-20'),
    },
  });

  // Tạo Parent
  const parent = await prisma.user.upsert({
    where: { email: 'parent@qne.edu.vn' },
    update: {},
    create: {
      email: 'parent@qne.edu.vn',
      password: hashedPassword,
      fullName: 'Lê Thị Phụ Huynh',
      username: 'parent',
      role: 'parent',
      phone: '0147258369',
      isActive: true,
    },
  });

  // Tạo Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@qne.edu.vn' },
    update: {},
    create: {
      email: 'admin@qne.edu.vn',
      password: hashedPassword,
      fullName: 'Admin System',
      username: 'admin_system',
      role: 'admin',
      phone: '0111222333',
      isActive: true,
    },
  });

  // Tạo School
  const school = await prisma.school.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440000' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Trung tâm QN Edu',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      phone: '0281234567',
    },
  });

  // Tạo Teacher profile
  await prisma.teacher.upsert({
    where: { userId: teacher.id },
    update: {},
    create: {
      userId: teacher.id,
      schoolId: school.id,
    },
  });

  // Tạo Student profile
  await prisma.student.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      schoolId: school.id,
      studentCode: 'ST001',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      grade: '12',
    },
  });

  // Tạo Parent profile
  await prisma.parent.upsert({
    where: { userId: parent.id },
    update: {},
    create: {
      userId: parent.id,
    },
  });

  // Tạo Student-Parent relationship
  const studentProfile = await prisma.student.findUnique({
    where: { userId: student.id }
  });
  
  const parentProfile = await prisma.parent.findUnique({
    where: { userId: parent.id }
  });

  // Update student with parentId
  await prisma.student.update({
    where: { id: studentProfile.id },
    data: {
      parentId: parentProfile.id,
    },
  });

  console.log('✅ Seed dữ liệu authentication hoàn thành!');
  console.log('📋 Tài khoản demo:');
  console.log('   Center Owner: owner@qne.edu.vn / 123456');
  console.log('   Teacher: teacher@qne.edu.vn / 123456');
  console.log('   Student: student@qne.edu.vn / 123456');
  console.log('   Parent: parent@qne.edu.vn / 123456');
  console.log('   Admin: admin@qne.edu.vn / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
