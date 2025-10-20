const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Configuration
const NUM_SCHOOLS = 2;
const NUM_TEACHERS = 10;
const NUM_STUDENTS = 50;
const NUM_PARENTS = 40;
const NUM_SUBJECTS = 6;
const NUM_CLASSES = 15;
const NUM_ROOMS = 5;

// Subject data
const SUBJECTS = [
  { name: 'Toán học', code: 'MATH', description: 'Môn Toán học từ cơ bản đến nâng cao' },
  { name: 'Vật lý', code: 'PHYSICS', description: 'Môn Vật lý học' },
  { name: 'Hóa học', code: 'CHEMISTRY', description: 'Môn Hóa học' },
  { name: 'Ngữ văn', code: 'LITERATURE', description: 'Môn Ngữ văn' },
  { name: 'Lịch sử', code: 'HISTORY', description: 'Môn Lịch sử' },
  { name: 'Tiếng Anh', code: 'ENGLISH', description: 'Môn Tiếng Anh' }
];

// Grade data
const GRADES = [
  { name: 'Lớp 10', level: 10, description: 'Lớp 10 - Trung học phổ thông' },
  { name: 'Lớp 11', level: 11, description: 'Lớp 11 - Trung học phổ thông' },
  { name: 'Lớp 12', level: 12, description: 'Lớp 12 - Trung học phổ thông' }
];

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...');

  try {
    // Clear existing data
    await clearDatabase();

    // Create core data
    const schools = await createSchools();
    const subjects = await createSubjects();
    const grades = await createGrades();
    const rooms = await createRooms();

    // Create users and profiles
    const adminUser = await createAdminUser();
    const teachers = await createTeachers(schools);
    const students = await createStudents(schools);
    const parents = await createParents();

    // Create relationships
    await createStudentParentRelationships(students, parents);

    // Create academic data
    const classes = await createClasses(subjects, rooms, grades);
    await createEnrollments(students, classes);
    await createClassSessions(classes);

    // Create financial data
    await createFeeStructures(classes);
    await createFeeRecords(students, classes);

    // Create additional data
    await createNotifications(adminUser);
    await createLeaveRequests(teachers, students);

    console.log('✅ Database seeding completed successfully!');
    await printSummary();

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

async function clearDatabase() {
  console.log('🧹 Clearing existing data...');

  await prisma.$transaction([
    prisma.studentAssessmentGrade.deleteMany(),
    prisma.studentSessionAttendance.deleteMany(),
    prisma.studentClassRequest.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.feeRecord.deleteMany(),
    prisma.feeStructure.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.assessment.deleteMany(),
    prisma.material.deleteMany(),
    prisma.classSession.deleteMany(),
    prisma.scheduleChange.deleteMany(),
    prisma.alert.deleteMany(),
    prisma.userSession.deleteMany(),
    prisma.class.deleteMany(),
    prisma.room.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.grade.deleteMany(),
    prisma.studentReport.deleteMany(),
    prisma.leaveRequest.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.contract.deleteMany(),
    prisma.payroll.deleteMany(),
    prisma.teacherDocument.deleteMany(),
    prisma.student.deleteMany(),
    prisma.parent.deleteMany(),
    prisma.teacher.deleteMany(),
    prisma.school.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function createSchools() {
  console.log('🏫 Creating schools...');
  const schools = [];

  for (let i = 0; i < NUM_SCHOOLS; i++) {
    const school = await prisma.school.create({
      data: {
        name: faker.helpers.arrayElement([
          `Trường THPT ${faker.location.city()}`,
          `Trung tâm Giáo dục ${faker.company.name()}`
        ]),
        address: faker.location.streetAddress(),
        phone: faker.phone.number(),
      },
    });
    schools.push(school);
  }

  return schools;
}

async function createSubjects() {
  console.log('📚 Creating subjects...');
  const subjects = [];

  for (const subjectData of SUBJECTS) {
    const subject = await prisma.subject.create({
      data: subjectData,
    });
    subjects.push(subject);
  }

  return subjects;
}

async function createGrades() {
  console.log('📚 Creating grades...');
  const grades = [];

  for (const gradeData of GRADES) {
    const grade = await prisma.grade.create({
      data: {
        ...gradeData,
        isActive: true
      }
    });
    grades.push(grade);
  }

  return grades;
}

async function createRooms() {
  console.log('🏢 Creating rooms...');
  const rooms = [];

  for (let i = 0; i < NUM_ROOMS; i++) {
    const room = await prisma.room.create({
      data: {
        name: `Phòng ${101 + i}`,
        capacity: faker.number.int({ min: 20, max: 50 }),
        equipment: {
          projector: faker.datatype.boolean(),
          whiteboard: true,
          airConditioner: faker.datatype.boolean(),
          computer: faker.datatype.boolean(),
        },
        isActive: true,
      },
    });
    rooms.push(room);
  }

  return rooms;
}

async function createAdminUser() {
  console.log('👤 Creating admin user...');

  return await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@school.com',
      password: await bcrypt.hash('admin123', 10),
      fullName: 'Administrator',
      role: 'admin',
      phone: '0123456789',
      isActive: true,
    },
  });
}

async function createTeachers(schools) {
  console.log('👨‍🏫 Creating teachers...');
  const teachers = [];

  for (let i = 0; i < NUM_TEACHERS; i++) {
    // Create user
    const user = await prisma.user.create({
      data: {
        username: `teacher${i + 1}`,
        email: `teacher${i + 1}@school.com`,
        password: await bcrypt.hash('teacher123', 10),
        fullName: faker.person.fullName(),
        role: 'teacher',
        phone: faker.phone.number(),
        isActive: true,
        gender: faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER']),
        birthDate: faker.date.birthdate({ min: 1980, max: 1995, mode: 'year' }),
      },
    });

    // Create teacher profile
    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        schoolId: faker.helpers.arrayElement(schools).id,
      },
    });

    teachers.push(teacher);
  }

  return teachers;
}

async function createStudents(schools) {
  console.log('👨‍🎓 Creating students...');
  const students = [];

  for (let i = 0; i < NUM_STUDENTS; i++) {
    // Create user
    const user = await prisma.user.create({
      data: {
        username: `student${i + 1}`,
        email: `student${i + 1}@school.com`,
        password: await bcrypt.hash('student123', 10),
        fullName: faker.person.fullName(),
        role: 'student',
        phone: faker.phone.number(),
        isActive: true,
        gender: faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER']),
        birthDate: faker.date.birthdate({ min: 2005, max: 2010, mode: 'year' }),
      },
    });

    // Create student profile
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        studentCode: `STU${String(i + 1).padStart(4, '0')}`,
        address: faker.location.streetAddress(),
        schoolId: faker.helpers.arrayElement(schools).id,
      },
    });

    students.push(student);
  }

  return students;
}

async function createParents() {
  console.log('👨‍👩‍👧‍👦 Creating parents...');
  const parents = [];

  for (let i = 0; i < NUM_PARENTS; i++) {
    // Create user
    const user = await prisma.user.create({
      data: {
        username: `parent${i + 1}`,
        email: `parent${i + 1}@school.com`,
        password: await bcrypt.hash('parent123', 10),
        fullName: faker.person.fullName(),
        role: 'parent',
        phone: faker.phone.number(),
        isActive: true,
        gender: faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER']),
        birthDate: faker.date.birthdate({ min: 1970, max: 1990, mode: 'year' }),
      },
    });

    // Create parent profile
    const parent = await prisma.parent.create({
      data: {
        userId: user.id,
      },
    });

    parents.push(parent);
  }

  return parents;
}

async function createStudentParentRelationships(students, parents) {
  console.log('🔗 Creating student-parent relationships...');

  for (let i = 0; i < Math.min(students.length, parents.length); i++) {
    await prisma.student.update({
      where: { id: students[i].id },
      data: {
        parentId: parents[i].id,
      },
    });
  }
}

async function createClasses(subjects, rooms, grades) {
  console.log('📖 Creating classes...');
  const classes = [];

  for (let i = 0; i < NUM_CLASSES; i++) {
    const subject = faker.helpers.arrayElement(subjects);
    const room = faker.helpers.arrayElement(rooms);
    const grade = faker.helpers.arrayElement(grades);

    const newClass = await prisma.class.create({
      data: {
        name: `${subject.name} ${grade.name}${String.fromCharCode(65 + (i % 3))}`,
        subjectId: subject.id,
        roomId: room.id,
        gradeId: grade.id,
        maxStudents: faker.number.int({ min: 20, max: 40 }),
        status: faker.helpers.arrayElement(['draft', 'active', 'completed']),
        description: faker.lorem.sentence(),
        academicYear: faker.helpers.arrayElement(['2023-2024', '2024-2025']),
        expectedStartDate: faker.date.future({ months: 2 }),
        actualStartDate: faker.datatype.boolean({ probability: 0.7 }) ? faker.date.recent() : null,
        actualEndDate: faker.datatype.boolean({ probability: 0.3 }) ? faker.date.future({ months: 6 }) : null,
        recurringSchedule: {
          schedules: faker.helpers.arrayElements(
            [
              { day: 'monday', startTime: '07:00', endTime: '09:00' },
              { day: 'monday', startTime: '14:00', endTime: '16:00' },
              { day: 'tuesday', startTime: '08:00', endTime: '10:00' },
              { day: 'tuesday', startTime: '15:00', endTime: '17:00' },
              { day: 'wednesday', startTime: '07:30', endTime: '09:30' },
              { day: 'wednesday', startTime: '14:30', endTime: '16:30' },
              { day: 'thursday', startTime: '08:30', endTime: '10:30' },
              { day: 'thursday', startTime: '15:30', endTime: '17:30' },
              { day: 'friday', startTime: '07:00', endTime: '09:00' },
              { day: 'friday', startTime: '14:00', endTime: '16:00' },
              { day: 'saturday', startTime: '08:00', endTime: '10:00' },
              { day: 'saturday', startTime: '15:00', endTime: '17:00' },
              { day: 'sunday', startTime: '09:00', endTime: '11:00' }
            ],
            faker.number.int({ min: 2, max: 4 })
          )
        }
      },
    });
    classes.push(newClass);
  }

  return classes;
}

async function createEnrollments(students, classes) {
  console.log('📝 Creating enrollments...');

  for (const student of students) {
    const numClasses = faker.number.int({ min: 1, max: 3 });
    const selectedClasses = faker.helpers.arrayElements(classes, numClasses);

    for (const classItem of selectedClasses) {
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          classId: classItem.id,
          status: faker.helpers.arrayElement(['active', 'completed', 'dropped']),
          semester: faker.helpers.arrayElement(['2024-1', '2024-2', '2025-1']),
          enrolledAt: faker.date.between({
            from: '2024-09-01',
            to: new Date()
          })
        },
      });
    }
  }
}

async function createClassSessions(classes) {
  console.log('📅 Creating class sessions...');
  const sessions = [];

  for (let i = 0; i < 50; i++) {
    const classItem = faker.helpers.arrayElement(classes);

    const session = await prisma.classSession.create({
      data: {
        classId: classItem.id,
        academicYear: faker.helpers.arrayElement(['2023-2024', '2024-2025']),
        sessionDate: faker.date.between({
          from: '2024-09-01',
          to: '2025-06-30'
        }),
        startTime: faker.helpers.arrayElement(['07:00', '08:00', '14:00', '15:00']),
        endTime: faker.helpers.arrayElement(['09:00', '10:00', '16:00', '17:00']),
        roomId: classItem.roomId,
        status: faker.helpers.arrayElement(['scheduled', 'completed', 'cancelled']),
        notes: faker.lorem.sentence(),
      },
    });
    sessions.push(session);
  }

  return sessions;
}

async function createFeeStructures(classes) {
  console.log('💰 Creating fee structures...');

  for (const classItem of classes) {
    const feeStructure = await prisma.feeStructure.create({
      data: {
        name: `Học phí ${classItem.name}`,
        amount: parseFloat(faker.finance.amount({ min: 50, max: 300, dec: 2 })),
        period: faker.helpers.arrayElement(['monthly', 'semester', 'yearly']),
        description: faker.lorem.sentence(),
        isActive: true,
      },
    });

    // Link fee structure to class
    await prisma.class.update({
      where: { id: classItem.id },
      data: { feeStructureId: feeStructure.id }
    });
  }
}

async function createFeeRecords(students, classes) {
  console.log('📋 Creating fee records...');

  // Get classes with fee structures
  const classesWithFees = await prisma.class.findMany({
    where: { feeStructureId: { not: null } },
    include: { feeStructure: true }
  });

  for (const student of students) {
    const numRecords = faker.number.int({ min: 1, max: 3 });
    const selectedClasses = faker.helpers.arrayElements(classesWithFees, numRecords);

    for (const classItem of selectedClasses) {
      const amount = parseFloat(classItem.feeStructure.amount);
      const paidAmount = faker.datatype.boolean({ probability: 0.7 }) ?
        parseFloat(faker.finance.amount({ min: 0, max: amount, dec: 2 })) : 0;

      await prisma.feeRecord.create({
        data: {
          studentId: student.id,
          feeStructureId: classItem.feeStructureId,
          amount: amount,
          dueDate: faker.date.future({ years: 1 }),
          paidAmount: paidAmount,
          status: paidAmount > 0 ? 'paid' : faker.helpers.arrayElement(['pending', 'overdue']),
          discount: parseFloat(faker.finance.amount({ min: 0, max: 50, dec: 2 })),
          notes: faker.lorem.sentence(),
        },
      });
    }
  }
}

async function createNotifications(adminUser) {
  console.log('🔔 Creating notifications...');

  for (let i = 0; i < 10; i++) {
    await prisma.notification.create({
      data: {
        title: faker.lorem.sentence(),
        body: faker.lorem.paragraph(),
        audience: {
          roles: faker.helpers.arrayElements(['teacher', 'student', 'parent']),
          schools: []
        },
        priority: faker.helpers.arrayElement(['low', 'normal', 'high', 'urgent']),
        type: faker.helpers.arrayElement(['general', 'academic', 'financial', 'emergency']),
        sentAt: faker.datatype.boolean({ probability: 0.8 }) ? faker.date.recent() : null,
        scheduledFor: faker.date.future(),
        createdBy: adminUser.id,
      },
    });
  }
}

async function createLeaveRequests(teachers, students) {
  console.log('🏖️ Creating leave requests...');

  // Teacher leave requests
  for (let i = 0; i < 5; i++) {
    const teacher = faker.helpers.arrayElement(teachers);
    const teacherUser = await prisma.user.findUnique({
      where: { id: teacher.userId }
    });

    await prisma.leaveRequest.create({
      data: {
        requestType: 'sick_leave',
        teacherId: teacher.id,
        startDate: faker.date.future(),
        endDate: faker.date.future(),
        reason: faker.lorem.sentence(),
        status: faker.helpers.arrayElement(['pending', 'approved', 'rejected']),
        createdBy: teacherUser.id,
        notes: faker.lorem.sentence(),
      },
    });
  }

  // Student leave requests
  for (let i = 0; i < 8; i++) {
    const student = faker.helpers.arrayElement(students);
    const studentUser = await prisma.user.findUnique({
      where: { id: student.userId }
    });

    await prisma.leaveRequest.create({
      data: {
        requestType: 'personal_leave',
        studentId: student.id,
        startDate: faker.date.future(),
        endDate: faker.date.future(),
        reason: faker.lorem.sentence(),
        status: faker.helpers.arrayElement(['pending', 'approved', 'rejected']),
        createdBy: studentUser.id,
        notes: faker.lorem.sentence(),
      },
    });
  }
}

async function printSummary() {
  console.log('\n📊 Database Summary:');

  const counts = await Promise.all([
    prisma.school.count(),
    prisma.teacher.count(),
    prisma.student.count(),
    prisma.parent.count(),
    prisma.grade.count(),
    prisma.subject.count(),
    prisma.class.count(),
    prisma.enrollment.count(),
    prisma.feeRecord.count(),
    prisma.notification.count(),
    prisma.leaveRequest.count(),
  ]);

  console.log(`🏫 Schools: ${counts[0]}`);
  console.log(`👨‍🏫 Teachers: ${counts[1]}`);
  console.log(`👨‍🎓 Students: ${counts[2]}`);
  console.log(`👨‍👩‍👧‍👦 Parents: ${counts[3]}`);
  console.log(`📚 Grades: ${counts[4]}`);
  console.log(`📖 Subjects: ${counts[5]}`);
  console.log(`📝 Classes: ${counts[6]}`);
  console.log(`📋 Enrollments: ${counts[7]}`);
  console.log(`💰 Fee Records: ${counts[8]}`);
  console.log(`🔔 Notifications: ${counts[9]}`);
  console.log(`🏖️ Leave Requests: ${counts[10]}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
