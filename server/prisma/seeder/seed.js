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
const NUM_ASSESSMENTS = 30;
const NUM_MATERIALS = 20;
const NUM_LEAVE_REQUESTS = 15;
const NUM_NOTIFICATIONS = 20;
const NUM_ALERTS = 10;
const NUM_AUDIT_LOGS = 25;
const NUM_CONTRACTS = 8;
const NUM_PAYROLLS = 12;
const NUM_TEACHER_DOCS = 15;
const NUM_USER_SESSIONS = 30;
const NUM_INCIDENT_REPORTS = 8;
const NUM_SCHEDULE_CHANGES = 10;
const NUM_STUDENT_CLASS_REQUESTS = 20;
const NUM_STUDENT_SESSION_ATTENDANCES = 100;
const NUM_STUDENT_ASSESSMENT_GRADES = 80;
const NUM_PAYMENTS = 40;
const NUM_CONTRACT_UPLOADS = 15;
const NUM_ACADEMIC_YEARS = 2;
const NUM_LEAVE_REQUEST_AFFECTED_SESSIONS = 20;
const NUM_CLASS_FEE_HISTORIES = 25;

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
    const feeStructures = await createFeeStructures(subjects, grades);
    const classes = await createClasses(subjects, rooms, grades, feeStructures);
    await createEnrollments(students, classes);
    await createClassSessions(classes);

    // Create financial data
    await createFeeRecords(students, classes);
    await createPayments(students, parents);

    // Create additional data
    await createAcademicYears();
    await createNotifications(adminUser);
    await createLeaveRequests(teachers, students);
    await createAssessments(classes);
    await createMaterials(classes, teachers);
    await createAlerts();
    await createAuditLogs(teachers, students);
    await createContracts(teachers);
    await createPayrolls(teachers);
    await createTeacherDocuments(teachers);
    await createUserSessions(teachers, students, parents);

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
    // Clear dependent tables first
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
    prisma.leaveRequestAffectedSession.deleteMany(),
    prisma.leaveRequest.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.contract.deleteMany(),
    prisma.payroll.deleteMany(),
    prisma.teacherDocument.deleteMany(),
    prisma.contractUpload.deleteMany(),
    prisma.incidentReport.deleteMany(),
    prisma.classFeeHistory.deleteMany(),
    prisma.academicYear.deleteMany(),
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
        teacherCode: `TCH${String(i + 1).padStart(4, '0')}`,
        schoolId: faker.helpers.arrayElement(schools).id,
        subjects: faker.helpers.arrayElements(
          ['Toán học', 'Vật lý', 'Hóa học', 'Ngữ văn', 'Lịch sử', 'Tiếng Anh'],
          faker.number.int({ min: 1, max: 3 })
        ),
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

async function createClasses(subjects, rooms, grades, feeStructures) {
  console.log('📖 Creating classes...');
  const classes = [];

  for (let i = 0; i < NUM_CLASSES; i++) {
    const subject = faker.helpers.arrayElement(subjects);
    const room = faker.helpers.arrayElement(rooms);
    const grade = faker.helpers.arrayElement(grades);
    
    // Find matching fee structure
    const matchingFeeStructure = feeStructures.find(fs => 
      fs.gradeId === grade.id && fs.subjectId === subject.id
    );

    const feeAmount = parseFloat(faker.finance.amount({ min: 50, max: 300, dec: 2 }));
    const feePeriod = faker.helpers.arrayElement(['per_session', 'monthly', 'semester', 'yearly']);

    const newClass = await prisma.class.create({
      data: {
        name: `${subject.name} ${grade.name}${String.fromCharCode(65 + (i % 3))}`,
        classCode: `CLS${String(i + 1).padStart(4, '0')}`,
        subjectId: subject.id,
        roomId: room.id,
        gradeId: grade.id,
        feeStructureId: matchingFeeStructure?.id,
        maxStudents: faker.number.int({ min: 20, max: 40 }),
        status: faker.helpers.arrayElement(['draft', 'active', 'completed']),
        description: faker.lorem.sentence(),
        academicYear: faker.helpers.arrayElement(['2023-2024', '2024-2025']),
        expectedStartDate: faker.date.future({ months: 2 }),
        actualStartDate: faker.datatype.boolean({ probability: 0.7 }) ? faker.date.recent() : null,
        actualEndDate: faker.datatype.boolean({ probability: 0.3 }) ? faker.date.future({ months: 6 }) : null,
        
        // Fee snapshot
        feeAmount: feeAmount,
        feePeriod: feePeriod,
        feeCurrency: 'VND',
        feeLockedAt: faker.datatype.boolean({ probability: 0.6 }) ? faker.date.recent() : null,
        
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

async function createFeeStructures(subjects, grades) {
  console.log('💰 Creating fee structures...');

  const feeStructures = [];
  
  // Create fee structures for each grade-subject combination
  for (const grade of grades) {
    for (const subject of subjects) {
      const feeStructure = await prisma.feeStructure.create({
        data: {
          name: `Học phí ${subject.name} ${grade.name}`,
          amount: parseFloat(faker.finance.amount({ min: 50, max: 300, dec: 2 })),
          period: faker.helpers.arrayElement(['per_session', 'monthly', 'semester', 'yearly']),
          description: `Học phí môn ${subject.name} cho ${grade.name}`,
          isActive: true,
          gradeId: grade.id,
          subjectId: subject.id,
        },
      });
      feeStructures.push(feeStructure);
    }
  }

  return feeStructures;
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
          classId: classItem.id,
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

// Additional functions for missing tables
async function createAcademicYears() {
  console.log('📅 Creating academic years...');
  
  const academicYears = [
    { year: '2023-2024', startDate: new Date('2023-09-01'), endDate: new Date('2024-06-30'), isActive: false },
    { year: '2024-2025', startDate: new Date('2024-09-01'), endDate: new Date('2025-06-30'), isActive: true }
  ];

  for (const yearData of academicYears) {
    await prisma.academicYear.create({
      data: yearData
    });
  }
}

async function createPayments(students, parents) {
  console.log('💳 Creating payments...');
  
  const feeRecords = await prisma.feeRecord.findMany({
    where: { status: { not: 'pending' } }
  });

  for (let i = 0; i < NUM_PAYMENTS && i < feeRecords.length; i++) {
    const feeRecord = feeRecords[i];
    const student = students.find(s => s.id === feeRecord.studentId);
    const parent = parents.find(p => p.id === student?.parentId);

    await prisma.payment.create({
      data: {
        feeRecordId: feeRecord.id,
        studentId: feeRecord.studentId,
        parentId: parent?.id,
        amount: feeRecord.paidAmount,
        method: faker.helpers.arrayElement(['cash', 'bank_transfer', 'credit_card', 'momo']),
        status: 'completed',
        reference: faker.string.alphanumeric(10),
        paidAt: faker.date.recent(),
        notes: faker.lorem.sentence(),
      },
    });
  }
}

async function createAssessments(classes) {
  console.log('📝 Creating assessments...');
  
  for (let i = 0; i < NUM_ASSESSMENTS; i++) {
    const classItem = faker.helpers.arrayElement(classes);
    
    await prisma.assessment.create({
      data: {
        classId: classItem.id,
        name: faker.helpers.arrayElement(['Kiểm tra 15 phút', 'Kiểm tra 1 tiết', 'Thi học kỳ', 'Bài tập lớn']),
        type: faker.helpers.arrayElement(['quiz', 'exam', 'assignment', 'project']),
        maxScore: parseFloat(faker.finance.amount({ min: 10, max: 100, dec: 0 })),
        date: faker.date.between({ from: '2024-09-01', to: '2025-06-30' }),
        description: faker.lorem.sentence(),
      },
    });
  }
}

async function createMaterials(classes, teachers) {
  console.log('📚 Creating materials...');
  
  for (let i = 0; i < NUM_MATERIALS; i++) {
    const classItem = faker.helpers.arrayElement(classes);
    const teacher = faker.helpers.arrayElement(teachers);
    
    await prisma.material.create({
      data: {
        classId: classItem.id,
        title: faker.helpers.arrayElement(['Bài giảng', 'Tài liệu tham khảo', 'Bài tập', 'Đề thi mẫu']),
        fileName: faker.system.fileName(),
        category: faker.helpers.arrayElement(['Lecture', 'Exercise', 'Reference', 'Exam']),
        uploadedBy: teacher.id,
        description: faker.lorem.sentence(),
        fileSize: faker.number.int({ min: 1024, max: 10485760 }), // 1KB to 10MB
        fileType: faker.helpers.arrayElement(['pdf', 'docx', 'pptx', 'xlsx']),
        fileUrl: faker.internet.url(),
        downloads: faker.number.int({ min: 0, max: 100 }),
      },
    });
  }
}

async function createAlerts() {
  console.log('🚨 Creating alerts...');
  
  for (let i = 0; i < NUM_ALERTS; i++) {
    await prisma.alert.create({
      data: {
        alertType: faker.helpers.arrayElement(['payment_overdue', 'attendance_low', 'grade_drop', 'system_error']),
        title: faker.lorem.sentence(),
        message: faker.lorem.paragraph(),
        payload: {
          severity: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
          category: faker.helpers.arrayElement(['academic', 'financial', 'system', 'attendance'])
        },
        severity: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
        processed: faker.datatype.boolean({ probability: 0.7 }),
        processedAt: faker.datatype.boolean({ probability: 0.7 }) ? faker.date.recent() : null,
      },
    });
  }
}

async function createAuditLogs(teachers, students) {
  console.log('📋 Creating audit logs...');
  
  const allUsers = [...teachers.map(t => t.userId), ...students.map(s => s.userId)];
  
  for (let i = 0; i < NUM_AUDIT_LOGS; i++) {
    await prisma.auditLog.create({
      data: {
        userId: faker.helpers.arrayElement(allUsers),
        action: faker.helpers.arrayElement(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']),
        tableName: faker.helpers.arrayElement(['users', 'students', 'teachers', 'classes', 'enrollments']),
        recordId: faker.string.uuid(),
        oldValues: faker.datatype.boolean({ probability: 0.5 }) ? { field: 'old_value' } : null,
        newValues: faker.datatype.boolean({ probability: 0.5 }) ? { field: 'new_value' } : null,
        ipAddress: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
      },
    });
  }
}

async function createContracts(teachers) {
  console.log('📄 Creating contracts...');
  
  for (let i = 0; i < NUM_CONTRACTS; i++) {
    const teacher = faker.helpers.arrayElement(teachers);
    
    await prisma.contract.create({
      data: {
        teacherId: teacher.id,
        startDate: faker.date.past(),
        endDate: faker.date.future(),
        salary: parseFloat(faker.finance.amount({ min: 5000000, max: 15000000, dec: 0 })),
        terms: {
          workingHours: faker.number.int({ min: 20, max: 40 }),
          benefits: ['Bảo hiểm', 'Nghỉ phép', 'Thưởng'],
          responsibilities: ['Giảng dạy', 'Chấm bài', 'Họp phụ huynh']
        },
        status: faker.helpers.arrayElement(['active', 'expired', 'terminated']),
      },
    });
  }
}

async function createPayrolls(teachers) {
  console.log('💰 Creating payrolls...');
  
  for (let i = 0; i < NUM_PAYROLLS; i++) {
    const teacher = faker.helpers.arrayElement(teachers);
    
    await prisma.payroll.create({
      data: {
        teacherId: teacher.id,
        periodStart: faker.date.past(),
        periodEnd: faker.date.recent(),
        baseSalary: parseFloat(faker.finance.amount({ min: 5000000, max: 10000000, dec: 0 })),
        bonuses: parseFloat(faker.finance.amount({ min: 0, max: 2000000, dec: 0 })),
        deductions: parseFloat(faker.finance.amount({ min: 0, max: 1000000, dec: 0 })),
        hourlyRate: parseFloat(faker.finance.amount({ min: 50000, max: 200000, dec: 0 })),
        teachingHours: parseFloat(faker.finance.amount({ min: 20, max: 40, dec: 1 })),
        totalAmount: parseFloat(faker.finance.amount({ min: 5000000, max: 12000000, dec: 0 })),
        status: faker.helpers.arrayElement(['pending', 'paid', 'cancelled']),
        paidAt: faker.datatype.boolean({ probability: 0.8 }) ? faker.date.recent() : null,
        computedDetails: {
          overtime: faker.number.int({ min: 0, max: 10 }),
          sickDays: faker.number.int({ min: 0, max: 3 }),
          vacationDays: faker.number.int({ min: 0, max: 5 })
        },
      },
    });
  }
}

async function createTeacherDocuments(teachers) {
  console.log('📁 Creating teacher documents...');
  
  for (let i = 0; i < NUM_TEACHER_DOCS; i++) {
    const teacher = faker.helpers.arrayElement(teachers);
    
    await prisma.teacherDocument.create({
      data: {
        teacherId: teacher.id,
        docType: faker.helpers.arrayElement(['cv', 'certificate', 'diploma', 'contract', 'id_card']),
        docUrl: faker.internet.url(),
      },
    });
  }
}

async function createUserSessions(teachers, students, parents) {
  console.log('🔐 Creating user sessions...');
  
  const allUsers = [
    ...teachers.map(t => t.userId),
    ...students.map(s => s.userId),
    ...parents.map(p => p.userId)
  ];
  
  for (let i = 0; i < NUM_USER_SESSIONS; i++) {
    const userId = faker.helpers.arrayElement(allUsers);
    
    await prisma.userSession.create({
      data: {
        userId: userId,
        refreshToken: faker.string.alphanumeric(64),
        expiresAt: faker.date.future(),
        isActive: faker.datatype.boolean({ probability: 0.8 }),
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
    prisma.academicYear.count(),
    prisma.payment.count(),
    prisma.assessment.count(),
    prisma.material.count(),
    prisma.alert.count(),
    prisma.auditLog.count(),
    prisma.contract.count(),
    prisma.payroll.count(),
    prisma.teacherDocument.count(),
    prisma.userSession.count(),
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
  console.log(`📅 Academic Years: ${counts[11]}`);
  console.log(`💳 Payments: ${counts[12]}`);
  console.log(`📝 Assessments: ${counts[13]}`);
  console.log(`📚 Materials: ${counts[14]}`);
  console.log(`🚨 Alerts: ${counts[15]}`);
  console.log(`📋 Audit Logs: ${counts[16]}`);
  console.log(`📄 Contracts: ${counts[17]}`);
  console.log(`💰 Payrolls: ${counts[18]}`);
  console.log(`📁 Teacher Documents: ${counts[19]}`);
  console.log(`🔐 User Sessions: ${counts[20]}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
