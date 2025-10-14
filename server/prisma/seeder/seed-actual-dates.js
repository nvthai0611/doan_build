const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedActualDates() {
  try {
    console.log('🌱 Bắt đầu seed actualStartDate và actualEndDate...');

    // Lấy tất cả classes
    const classes = await prisma.class.findMany({
      select: {
        id: true,
        name: true,
        expectedStartDate: true,
        status: true,
        academicYear: true,
        createdAt: true
      }
    });

    console.log(`📚 Tìm thấy ${classes.length} lớp học`);

    let updatedCount = 0;

    for (const classItem of classes) {
      let actualStartDate = null;
      let actualEndDate = null;

      // Logic đơn giản hơn: set actualStartDate cho tất cả classes có expectedStartDate
      if (classItem.expectedStartDate) {
        actualStartDate = classItem.expectedStartDate;
        
        // Tính actualEndDate dựa trên academic year hoặc thêm 6 tháng
        if (classItem.academicYear) {
          const yearParts = classItem.academicYear.split('-');
          if (yearParts.length === 2) {
            const endYear = parseInt(yearParts[1]);
            actualEndDate = new Date(endYear, 5, 30); // Tháng 6
          }
        } else {
          // Nếu không có academicYear, thêm 1 năm vào expectedStartDate
          const startDate = new Date(classItem.expectedStartDate);
          actualEndDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
        }
      } else {
        // Nếu không có expectedStartDate, dùng createdAt + 1 tháng
        const createdAt = new Date(classItem.createdAt);
        actualStartDate = new Date(createdAt.getFullYear(), createdAt.getMonth() + 1, createdAt.getDate());
        actualEndDate = new Date(createdAt.getFullYear() + 1, createdAt.getMonth() + 1, createdAt.getDate());
      }

      // Update class
      await prisma.class.update({
        where: { id: classItem.id },
        data: {
          actualStartDate,
          actualEndDate
        }
      });

      console.log(`✅ Cập nhật lớp "${classItem.name}":`);
      console.log(`   - actualStartDate: ${actualStartDate.toISOString().split('T')[0]}`);
      console.log(`   - actualEndDate: ${actualEndDate.toISOString().split('T')[0]}`);
      console.log(`   - Status: ${classItem.status}`);
      
      updatedCount++;
    }

    console.log(`\n🎉 Hoàn thành! Đã cập nhật ${updatedCount}/${classes.length} lớp học`);

  } catch (error) {
    console.error('❌ Lỗi khi seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy seed
seedActualDates()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });