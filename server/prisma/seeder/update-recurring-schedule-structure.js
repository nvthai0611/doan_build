const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating recurring schedule structure...');

  try {
    // Get all classes with old structure
    const classes = await prisma.class.findMany({
      where: {
        recurringSchedule: {
          not: null
        }
      }
    });

    console.log(`Found ${classes.length} classes to update`);

    let updatedCount = 0;

    for (const classItem of classes) {
      const oldSchedule = classItem.recurringSchedule;
      
      // Check if it's old structure (has days array)
      if (oldSchedule && oldSchedule.days && Array.isArray(oldSchedule.days)) {
        // Convert old structure to new structure
        const newSchedule = {
          schedules: oldSchedule.days.map(day => ({
            day: day,
            startTime: oldSchedule.startTime || '08:00',
            endTime: oldSchedule.endTime || '09:30'
          }))
        };

        await prisma.class.update({
          where: { id: classItem.id },
          data: {
            recurringSchedule: newSchedule
          }
        });
        
        console.log(`✅ Updated class "${classItem.name}" from old to new structure`);
        updatedCount++;
      } else if (oldSchedule && oldSchedule.schedules) {
        console.log(`⏭️  Class "${classItem.name}" already has new structure`);
      }
    }

    // Also update teacherClassAssignments
    const assignments = await prisma.teacherClassAssignment.findMany({
      where: {
        recurringSchedule: {
          not: null
        }
      }
    });

    console.log(`Found ${assignments.length} teacher assignments to update`);

    for (const assignment of assignments) {
      const oldSchedule = assignment.recurringSchedule;
      
      // Check if it's old structure (has days array)
      if (oldSchedule && oldSchedule.days && Array.isArray(oldSchedule.days)) {
        // Convert old structure to new structure
        const newSchedule = {
          schedules: oldSchedule.days.map(day => ({
            day: day,
            startTime: oldSchedule.startTime || '08:00',
            endTime: oldSchedule.endTime || '09:30'
          }))
        };

        await prisma.teacherClassAssignment.update({
          where: { id: assignment.id },
          data: {
            recurringSchedule: newSchedule
          }
        });
        
        console.log(`✅ Updated assignment ${assignment.id} from old to new structure`);
        updatedCount++;
      }
    }

    console.log(`🎉 Successfully updated ${updatedCount} records`);

  } catch (error) {
    console.error('❌ Error updating recurring schedule structure:', error);
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
