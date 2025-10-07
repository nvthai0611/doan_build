const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu authentication...');

  try {
    // Tạo users mẫu
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Tạo Center Owner
    const centerOwner = await prisma.user.upsert({
      where: { email: 'owner@qne.edu.vn' },
      update: {},
      create: {
        email: 'owner@qne.edu.vn',
        password: hashedPassword,
        fullName: 'Phan Ngọc Ánh - Chủ Trung Tâm',
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
        fullName: 'Nguyễn Văn Giáo - Giáo Viên',
        username: 'teacher',
        role: 'teacher',
        phone: '0987654321',
        isActive: true,
      },
    });

    // Tạo Student
    const student = await prisma.user.upsert({
      where: { email: 'student@qne.edu.vn' },
      update: {},
      create: {
        email: 'student@qne.edu.vn',
        password: hashedPassword,
        fullName: 'Trần Văn Học - Học Sinh',
        username: 'student',
        role: 'student',
        phone: '0369258147',
        isActive: true,
      },
    });

    // Tạo Parent
    const parent = await prisma.user.upsert({
      where: { email: 'parent@qne.edu.vn' },
      update: {},
      create: {
        email: 'parent@qne.edu.vn',
        password: hashedPassword,
        fullName: 'Lê Thị Phụ Huynh - Phụ Huynh',
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
        fullName: 'Admin System - Quản Trị Viên',
        username: 'admin_system',
        role: 'admin',
        phone: '0111222333',
        isActive: true,
      },
    });

    console.log('✅ Seed dữ liệu authentication hoàn thành!');
    console.log('\n🎯 TÀI KHOẢN DEMO SẴN SÀNG:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('👑 CENTER OWNER (Chủ Trung Tâm):');
    console.log('   📧 Email: owner@qne.edu.vn');
    console.log('   🔑 Password: 123456');
    console.log('   👤 Tên: Phan Ngọc Ánh - Chủ Trung Tâm');
    console.log('   📱 Phone: 0123456789');
    console.log('');
    console.log('👨‍🏫 TEACHER (Giáo Viên):');
    console.log('   📧 Email: teacher@qne.edu.vn');
    console.log('   🔑 Password: 123456');
    console.log('   👤 Tên: Nguyễn Văn Giáo - Giáo Viên');
    console.log('   📱 Phone: 0987654321');
    console.log('');
    console.log('👨‍🎓 STUDENT (Học Sinh):');
    console.log('   📧 Email: student@qne.edu.vn');
    console.log('   🔑 Password: 123456');
    console.log('   👤 Tên: Trần Văn Học - Học Sinh');
    console.log('   📱 Phone: 0369258147');
    console.log('');
    console.log('👨‍👩‍👧‍👦 PARENT (Phụ Huynh):');
    console.log('   📧 Email: parent@qne.edu.vn');
    console.log('   🔑 Password: 123456');
    console.log('   👤 Tên: Lê Thị Phụ Huynh - Phụ Huynh');
    console.log('   📱 Phone: 0147258369');
    console.log('');
    console.log('⚙️ ADMIN (Quản Trị Viên):');
    console.log('   📧 Email: admin@qne.edu.vn');
    console.log('   🔑 Password: 123456');
    console.log('   👤 Tên: Admin System - Quản Trị Viên');
    console.log('   📱 Phone: 0111222333');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n💡 Lưu ý: Tất cả tài khoản đều có mật khẩu: 123456');
    console.log('🚀 Bạn có thể đăng nhập với bất kỳ tài khoản nào để test!');
    
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    throw error;
  }
}

main()
