// seed.js - Updated for new database schema
const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// Configuration
const NUM_SCHOOLS = 3;
const NUM_TEACHERS = 15;
const NUM_STUDENTS = 100;
const NUM_PARENTS = 80;
const NUM_SUBJECTS = 8;
const NUM_CLASSES = 25;
const NUM_SESSIONS = 150;
const NUM_ASSESSMENTS = 50;

// Gender enum values
const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER'];

// Subject data
const SUBJECTS = [
  { name: 'Toán học', code: 'MATH', description: 'Môn Toán học từ cơ bản đến nâng cao' },
  { name: 'Vật lý', code: 'PHYSICS', description: 'Môn Vật lý học' },
  { name: 'Hóa học', code: 'CHEMISTRY', description: 'Môn Hóa học' },
  { name: 'Sinh học', code: 'BIOLOGY', description: 'Môn Sinh học' },
  { name: 'Ngữ văn', code: 'LITERATURE', description: 'Môn Ngữ văn' },
  { name: 'Lịch sử', code: 'HISTORY', description: 'Môn Lịch sử' },
  { name: 'Địa lý', code: 'GEOGRAPHY', description: 'Môn Địa lý' },
  { name: 'Tiếng Anh', code: 'ENGLISH', description: 'Môn Tiếng Anh' }
];

// Grade levels
const GRADE_LEVELS = ['Lớp 10', 'Lớp 11', 'Lớp 12'];

async function main() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Clear existing data
    await clearDatabase();
    
    // Create core data
    const schools = await createSchools();
    const subjects = await createSubjects();
    const rooms = await createRooms();
    
    // Create users and profiles
    const adminUser = await createAdminUser();
    const teachers = await createTeachers(schools);
    const students = await createStudents(schools);
    const parents = await createParents();
    
    // Create relationships
    await createStudentParentRelationships(students, parents);
    
    // Create academic data
    const classes = await createClasses(teachers, subjects, rooms);
    await createEnrollments(students, classes);
    const sessions = await createClassSessions(classes);
    await createAttendances(sessions, students);
    
    // Create assessments and grades
    const assessments = await createAssessments(classes);
    await createGrades(assessments, students, teachers);
    
    // Create financial data
    await createFeeStructures(classes);
    await createFeeRecords(students, classes);
    await createPayments(students);
    
    // Create HR data
    await createContracts(teachers);
    await createPayrolls(teachers);
    await createTeacherDocuments(teachers);
    
    // Create additional data
    await createNotifications(adminUser);
    await createLeaveRequests(teachers, students);
    await createStudentReports(students);
    
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
    prisma.class.deleteMany(),
    prisma.room.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.studentParentRelationship.deleteMany(),
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
          `Trường THCS ${faker.location.city()}`,
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

async function createRooms() {
  console.log('🏢 Creating rooms...');
  const rooms = [];
  
  for (let i = 0; i < 10; i++) {
    const room = await prisma.room.create({
      data: {
        name: `Phòng ${101 + i}`,
        capacity: faker.number.int({ min: 20, max: 50 }),
        equipment: {
          projector: faker.datatype.boolean(),
          whiteboard: true,
          airConditioner: faker.datatype.boolean(),
          computer: faker.datatype.boolean(),
          soundSystem: faker.datatype.boolean(),
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
      },
    });
    
    // Create teacher profile
    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        schoolId: faker.helpers.arrayElement(schools).id,
        hireDate: faker.date.past({ years: 5 }),
        contractEnd: faker.date.future({ years: 2 }),
        subjects: faker.helpers.arrayElements(
          SUBJECTS.map(s => s.name), 
          faker.number.int({ min: 1, max: 3 })
        ),
        salary: parseFloat(faker.finance.amount({ min: 1000, max: 5000, dec: 2 })),
        birthDate: faker.date.birthdate({ min: 1980, max: 1995, mode: 'year' }),
        gender: faker.helpers.arrayElement(GENDER_OPTIONS),
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
      },
    });
    
    // Create student profile
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        studentCode: `STU${String(i + 1).padStart(4, '0')}`,
        birthDate: faker.date.birthdate({ min: 2005, max: 2010, mode: 'year' }),
        gender: faker.helpers.arrayElement(GENDER_OPTIONS),
        address: faker.location.streetAddress(),
        grade: faker.helpers.arrayElement(GRADE_LEVELS),
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
    await prisma.studentParentRelationship.create({
      data: {
        studentId: students[i].id,
        parentId: parents[i].id,
        relation: faker.helpers.arrayElement(['father', 'mother', 'guardian']),
        primaryContact: faker.datatype.boolean({ probability: 0.7 }),
      },
    });
  }
}

async function createClasses(teachers, subjects, rooms) {
  console.log('📖 Creating classes...');
  const classes = [];
  
  for (let i = 0; i < NUM_CLASSES; i++) {
    const teacher = faker.helpers.arrayElement(teachers);
    const subject = faker.helpers.arrayElement(subjects);
    const room = faker.helpers.arrayElement(rooms);
    const grade = faker.helpers.arrayElement(GRADE_LEVELS);
    
    const newClass = await prisma.class.create({
      data: {
        name: `${subject.name} ${grade}${String.fromCharCode(65 + (i % 3))}`,
        grade: grade,
        subjectId: subject.id,
        teacherId: teacher.id,
        roomId: room.id,
        maxStudents: faker.number.int({ min: 20, max: 40 }),
        startDate: faker.date.future({ years: 0.5 }),
        endDate: faker.date.future({ years: 1.5 }),
        recurringSchedule: {
          days: faker.helpers.arrayElements(
            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], 
            faker.number.int({ min: 1, max: 3 })
          ),
          startTime: faker.helpers.arrayElement(['07:00', '08:00', '14:00', '15:00']),
          endTime: faker.helpers.arrayElement(['09:00', '10:00', '16:00', '17:00'])
        },
        status: faker.helpers.arrayElement(['draft', 'active', 'completed']),
        description: faker.lorem.sentence(),
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
        },
      });
    }
  }
}

async function createClassSessions(classes) {
  console.log('📅 Creating class sessions...');
  const sessions = [];
  
  for (let i = 0; i < NUM_SESSIONS; i++) {
    const classItem = faker.helpers.arrayElement(classes);
    const sessionDate = faker.date.recent({ days: 60 });
    
    const session = await prisma.classSession.create({
      data: {
        classId: classItem.id,
        sessionDate: sessionDate,
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

async function createAttendances(sessions, students) {
  console.log('✅ Creating attendances...');
  
  for (const session of sessions) {
    // Get students enrolled in this class
    const enrollments = await prisma.enrollment.findMany({
      where: { classId: session.classId },
      include: { student: true }
    });
    
    // Get a teacher to record attendance
    const classData = await prisma.class.findUnique({
      where: { id: session.classId },
      include: { teacher: { include: { user: true } } }
    });
    
    if (!classData || !classData.teacher) continue;
    
    for (const enrollment of enrollments) {
      await prisma.studentSessionAttendance.create({
        data: {
          sessionId: session.id,
          studentId: enrollment.student.id,
          status: faker.helpers.arrayElement(['present', 'absent', 'late', 'excused']),
          note: faker.lorem.sentence(),
          recordedBy: classData.teacher.user.id,
        },
      });
    }
  }
}

async function createAssessments(classes) {
  console.log('📊 Creating assessments...');
  const assessments = [];
  
  for (let i = 0; i < NUM_ASSESSMENTS; i++) {
    const classItem = faker.helpers.arrayElement(classes);
    const assessmentTypes = ['15_min', '45_min', 'homework', 'midterm', 'final'];
    const maxScores = [10, 15, 20, 100];
    
    const assessment = await prisma.assessment.create({
      data: {
        name: faker.helpers.arrayElement([
          'Kiểm tra 15 phút',
          'Kiểm tra 1 tiết', 
          'Bài tập về nhà',
          'Thi giữa kỳ',
          'Thi cuối kỳ'
        ]),
        type: faker.helpers.arrayElement(assessmentTypes),
        maxScore: faker.helpers.arrayElement(maxScores),
        date: faker.date.recent({ days: 30 }),
        description: faker.lorem.sentence(),
        classId: classItem.id,
      },
    });
    assessments.push(assessment);
  }
  
  return assessments;
}

async function createGrades(assessments, students, teachers) {
  console.log('📈 Creating grades...');
  
  for (const assessment of assessments) {
    // Get students enrolled in this class
    const enrollments = await prisma.enrollment.findMany({
      where: { classId: assessment.classId },
      include: { student: true }
    });
    
    // Get class teacher
    const classData = await prisma.class.findUnique({
      where: { id: assessment.classId },
      include: { teacher: { include: { user: true } } }
    });
    
    if (!classData || !classData.teacher) continue;
    
    // Randomly select students to grade (80% chance)
    const studentsToGrade = enrollments.filter(() => faker.datatype.boolean({ probability: 0.8 }));
    
    for (const enrollment of studentsToGrade) {
      const score = faker.number.float({ 
        min: 0, 
        max: parseFloat(assessment.maxScore), 
        fractionDigits: 1 
      });
      
      await prisma.studentAssessmentGrade.create({
        data: {
          assessmentId: assessment.id,
          studentId: enrollment.student.id,
          score: score,
          feedback: faker.helpers.arrayElement([
            'Làm bài tốt!',
            'Cần cải thiện thêm',
            'Xuất sắc!',
            'Cần chú ý hơn',
            'Tốt, tiếp tục phát huy',
            'Cần ôn tập lại kiến thức',
            'Rất tốt!',
            'Cần cố gắng hơn nữa'
          ]),
          gradedBy: classData.teacher.user.id,
        },
      });
    }
  }
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

async function createPayments(students) {
  console.log('💳 Creating payments...');
  
  const feeRecords = await prisma.feeRecord.findMany({
    where: { status: 'paid' }
  });
  
  for (const feeRecord of feeRecords) {
    await prisma.payment.create({
      data: {
        feeRecordId: feeRecord.id,
        studentId: feeRecord.studentId,
        amount: feeRecord.paidAmount,
        method: faker.helpers.arrayElement(['cash', 'bank_transfer', 'credit_card']),
        status: 'completed',
        reference: faker.string.alphanumeric(10),
        notes: faker.lorem.sentence(),
      },
    });
  }
}

async function createContracts(teachers) {
  console.log('📄 Creating contracts...');
  
  for (const teacher of teachers) {
    await prisma.contract.create({
      data: {
        teacherId: teacher.id,
        startDate: faker.date.past(),
        endDate: faker.date.future({ years: 1 }),
        salary: teacher.salary,
        status: faker.helpers.arrayElement(['active', 'expired', 'terminated']),
        terms: {
          workingHours: '40 hours/week',
          benefits: ['Health insurance', 'Paid leave', 'Professional development'],
          responsibilities: ['Teaching', 'Grading', 'Parent communication']
        },
      },
    });
  }
}

async function createPayrolls(teachers) {
  console.log('💼 Creating payrolls...');
  
  for (const teacher of teachers) {
    for (let i = 0; i < 6; i++) { // 6 months of payroll
      const baseSalary = parseFloat(teacher.salary || 0);
      const bonuses = parseFloat(faker.finance.amount({ min: 0, max: 500, dec: 2 }));
      const deductions = parseFloat(faker.finance.amount({ min: 0, max: 200, dec: 2 }));
      const totalAmount = baseSalary + bonuses - deductions;
      
      await prisma.payroll.create({
        data: {
          teacherId: teacher.id,
          periodStart: faker.date.past(),
          periodEnd: faker.date.recent(),
          baseSalary: baseSalary,
          teachingHours: faker.number.float({ min: 20, max: 40, fractionDigits: 2 }),
          hourlyRate: baseSalary / 40,
          bonuses: bonuses,
          deductions: deductions,
          totalAmount: totalAmount,
          status: faker.helpers.arrayElement(['pending', 'paid']),
          computedDetails: {
            overtime: bonuses,
            insurance: deductions * 0.1,
            tax: deductions * 0.2
          }
        },
      });
    }
  }
}

async function createTeacherDocuments(teachers) {
  console.log('📁 Creating teacher documents...');
  
  for (const teacher of teachers) {
    const numDocs = faker.number.int({ min: 1, max: 3 });
    
    for (let i = 0; i < numDocs; i++) {
      await prisma.teacherDocument.create({
        data: {
          teacherId: teacher.id,
          docType: faker.helpers.arrayElement(['degree', 'certificate', 'id_card', 'contract']),
          docUrl: faker.internet.url(),
        },
      });
    }
  }
}

async function createNotifications(adminUser) {
  console.log('🔔 Creating notifications...');
  
  for (let i = 0; i < 20; i++) {
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
  for (let i = 0; i < 10; i++) {
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
  for (let i = 0; i < 15; i++) {
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

async function createStudentReports(students) {
  console.log('📊 Creating student reports...');
  
  for (const student of students) {
    await prisma.studentReport.create({
      data: {
        studentId: student.id,
        period: faker.helpers.arrayElement(['Học kỳ 1', 'Học kỳ 2', 'Cả năm']),
        startDate: faker.date.past(),
        endDate: faker.date.recent(),
        attendance: {
          totalSessions: faker.number.int({ min: 20, max: 40 }),
          present: faker.number.int({ min: 15, max: 40 }),
          absent: faker.number.int({ min: 0, max: 5 }),
          late: faker.number.int({ min: 0, max: 3 })
        },
        grades: {
          average: faker.number.float({ min: 5.0, max: 10.0, fractionDigits: 1 }),
          subjects: faker.helpers.arrayElements(SUBJECTS.map(s => s.name), 5).map(name => ({
            name,
            grade: faker.number.float({ min: 5.0, max: 10.0, fractionDigits: 1 })
          }))
        },
        feedback: faker.lorem.paragraph(),
        suggestions: faker.lorem.sentence(),
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
    prisma.class.count(),
    prisma.enrollment.count(),
    prisma.assessment.count(),
    prisma.studentAssessmentGrade.count(),
    prisma.feeRecord.count(),
    prisma.payment.count(),
  ]);
  
  console.log(`🏫 Schools: ${counts[0]}`);
  console.log(`👨‍🏫 Teachers: ${counts[1]}`);
  console.log(`👨‍🎓 Students: ${counts[2]}`);
  console.log(`👨‍👩‍👧‍👦 Parents: ${counts[3]}`);
  console.log(`📖 Classes: ${counts[4]}`);
  console.log(`📝 Enrollments: ${counts[5]}`);
  console.log(`📊 Assessments: ${counts[6]}`);
  console.log(`📈 Grades: ${counts[7]}`);
  console.log(`💰 Fee Records: ${counts[8]}`);
  console.log(`💳 Payments: ${counts[9]}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });