const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedActualDates() {
  try {
    console.log('🌱 Bắt đầu seed expectedStartDate, actualStartDate và actualEndDate...');

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
      let expectedStartDate = classItem.expectedStartDate;
      let actualStartDate = null;
      let actualEndDate = null;

      // 1. Thêm expectedStartDate cho các lớp chưa có
      if (!expectedStartDate) {
        const createdAt = new Date(classItem.createdAt);
        expectedStartDate = new Date(createdAt.getFullYear(), createdAt.getMonth() + 1, createdAt.getDate());
        console.log(`📅 Thêm expectedStartDate cho lớp "${classItem.name}": ${expectedStartDate.toISOString().split('T')[0]}`);
      }

      // 2. Chỉ thêm actualStartDate và actualEndDate cho các lớp không phải draft
      if (classItem.status !== 'draft') {
        actualStartDate = expectedStartDate;
        
        // Tính actualEndDate dựa trên academic year hoặc thêm 1 năm
        if (classItem.academicYear) {
          const yearParts = classItem.academicYear.split('-');
          if (yearParts.length === 2) {
            const endYear = parseInt(yearParts[1]);
            actualEndDate = new Date(endYear, 5, 30); // Tháng 6
          }
        } else {
          // Nếu không có academicYear, thêm 1 năm vào expectedStartDate
          const startDate = new Date(expectedStartDate);
          actualEndDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
        }
      }

      // Update class
      const updateData = {
        expectedStartDate
      };

      // Chỉ thêm actualStartDate và actualEndDate nếu không phải draft
      if (classItem.status !== 'draft') {
        updateData.actualStartDate = actualStartDate;
        updateData.actualEndDate = actualEndDate;
      }

      await prisma.class.update({
        where: { id: classItem.id },
        data: updateData
      });

      console.log(`✅ Cập nhật lớp "${classItem.name}":`);
      console.log(`   - expectedStartDate: ${expectedStartDate.toISOString().split('T')[0]}`);
      if (classItem.status !== 'draft') {
        console.log(`   - actualStartDate: ${actualStartDate.toISOString().split('T')[0]}`);
        console.log(`   - actualEndDate: ${actualEndDate.toISOString().split('T')[0]}`);
      } else {
        console.log(`   - actualStartDate: null (draft status)`);
        console.log(`   - actualEndDate: null (draft status)`);
      }
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