const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating classes with recurring schedule and academic year...');

  try {
    // Get all classes
    const classes = await prisma.class.findMany({
      include: {
        teacherClassAssignments: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Get the most recent assignment
        }
      }
    });

    console.log(`Found ${classes.length} classes to update`);

    let updatedCount = 0;

    for (const classItem of classes) {
      // Get the most recent teacher assignment for this class
      const latestAssignment = classItem.teacherClassAssignments[0];
      
      if (latestAssignment) {
        // Update class with schedule and academic year from the latest assignment
        await prisma.class.update({
          where: { id: classItem.id },
          data: {
            recurringSchedule: latestAssignment.recurringSchedule,
            academicYear: latestAssignment.academicYear
          }
        });
        
        console.log(`✅ Updated class "${classItem.name}" with schedule and academic year`);
        updatedCount++;
      } else {
        // If no assignment exists, create default schedule
        const defaultSchedule = {
          days: faker.helpers.arrayElements(
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            faker.number.int({ min: 1, max: 3 })
          ),
          startTime: faker.helpers.arrayElement(['07:00', '08:00', '14:00', '15:00']),
          endTime: faker.helpers.arrayElement(['09:00', '10:00', '16:00', '17:00'])
        };

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const defaultAcademicYear = currentMonth >= 9 
          ? `${currentYear}-${currentYear + 1}` 
          : `${currentYear - 1}-${currentYear}`;

        await prisma.class.update({
          where: { id: classItem.id },
          data: {
            recurringSchedule: defaultSchedule,
            academicYear: defaultAcademicYear
          }
        });
        
        console.log(`✅ Updated class "${classItem.name}" with default schedule and academic year`);
        updatedCount++;
      }
    }

    console.log(`🎉 Successfully updated ${updatedCount} classes`);

  } catch (error) {
    console.error('❌ Error updating classes:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
