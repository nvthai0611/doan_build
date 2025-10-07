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
const NUM_ALERTS = 20;
const NUM_SCHEDULE_CHANGES = 15;

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

    // THÊM dòng này
    const academicYears = await createAcademicYears();

    // Create permission system
    const roles = await createRoles();
    const permissions = await createPermissions();
    await createRolePermissions(roles, permissions);

    // Create users and profiles
    const adminUser = await createAdminUser();
    const teachers = await createTeachers(schools);
    const students = await createStudents(schools);
    const parents = await createParents();

    // Create relationships
    await createStudentParentRelationships(students, parents);

    // Create academic data
    const classes = await createClasses(subjects, rooms);

    // Tạo teacher assignments TRƯỚC khi tạo enrollments
    const assignments = await createTeacherAssignments(teachers, classes, academicYears);

    // CẬP NHẬT để truyền assignments
    await createEnrollments(students, classes, assignments);
    const sessions = await createClassSessions(classes, academicYears);
    await createAttendances(sessions, students);

    // Create assessments and grades - cần sửa để dùng assignments thay vì teacher trực tiếp
    const assessments = await createAssessments(classes, assignments);
    await createGrades(assessments, students, assignments);

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
    await createAlerts();
    await createScheduleChanges(classes, rooms);
    await createUserSessions(teachers, students, parents, adminUser);

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
    prisma.teacherClassAssignment.deleteMany(),
    prisma.scheduleChange.deleteMany(),
    prisma.alert.deleteMany(),
    prisma.userSession.deleteMany(),
    prisma.class.deleteMany(),
    prisma.room.deleteMany(),
    prisma.subject.deleteMany(),
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
    prisma.rolePermission.deleteMany(),
    prisma.role.deleteMany(),
    prisma.permission.deleteMany(),
    // THÊM dòng này
    prisma.academicYear.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

// THÊM hàm này
async function createAcademicYears() {
  console.log('📅 Creating academic years...');
  const academicYears = [];

  const yearData = [
    {
      year: '2023-2024',
      startDate: new Date('2023-09-01'),
      endDate: new Date('2024-06-30'),
      isActive: false
    },
    {
      year: '2024-2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      isActive: true // Năm học hiện tại
    },
    {
      year: '2025-2026',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-06-30'),
      isActive: false
    }
  ];

  for (const data of yearData) {
    const academicYear = await prisma.academicYear.create({
      data: data
    });
    academicYears.push(academicYear);
  }

  return academicYears;
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

// Permission System Functions
async function createRoles() {
  console.log('🔐 Creating roles...');
  const roles = [];

  const roleData = [
    { name: 'admin', displayName: 'Administrator', description: 'System administrator with full access' },
    { name: 'teacher', displayName: 'Teacher', description: 'Teacher with class management permissions' },
    { name: 'student', displayName: 'Student', description: 'Student with limited access to their data' },
    { name: 'parent', displayName: 'Parent', description: 'Parent with access to their children data' },
    { name: 'manager', displayName: 'Manager', description: 'School manager with administrative permissions' },
  ];

  for (const role of roleData) {
    const createdRole = await prisma.role.create({
      data: role,
    });
    roles.push(createdRole);
  }

  return roles;
}

async function createPermissions() {
  console.log('🔑 Creating permissions...');
  const permissions = [];

  const permissionData = [
    // Student permissions
    { name: 'students.view', displayName: 'View Students', description: 'View student information', module: 'students', action: 'view' },
    { name: 'students.create', displayName: 'Create Students', description: 'Create new students', module: 'students', action: 'create' },
    { name: 'students.edit', displayName: 'Edit Students', description: 'Edit student information', module: 'students', action: 'edit' },
    { name: 'students.delete', displayName: 'Delete Students', description: 'Delete students', module: 'students', action: 'delete' },

    // Teacher permissions
    { name: 'teachers.view', displayName: 'View Teachers', description: 'View teacher information', module: 'teachers', action: 'view' },
    { name: 'teachers.create', displayName: 'Create Teachers', description: 'Create new teachers', module: 'teachers', action: 'create' },
    { name: 'teachers.edit', displayName: 'Edit Teachers', description: 'Edit teacher information', module: 'teachers', action: 'edit' },
    { name: 'teachers.delete', displayName: 'Delete Teachers', description: 'Delete teachers', module: 'teachers', action: 'delete' },

    // Class permissions
    { name: 'classes.view', displayName: 'View Classes', description: 'View class information', module: 'classes', action: 'view' },
    { name: 'classes.create', displayName: 'Create Classes', description: 'Create new classes', module: 'classes', action: 'create' },
    { name: 'classes.edit', displayName: 'Edit Classes', description: 'Edit class information', module: 'classes', action: 'edit' },
    { name: 'classes.delete', displayName: 'Delete Classes', description: 'Delete classes', module: 'classes', action: 'delete' },

    // Schedule permissions
    { name: 'schedule.view', displayName: 'View Schedule', description: 'View class schedules', module: 'schedule', action: 'view' },
    { name: 'schedule.create', displayName: 'Create Schedule', description: 'Create class schedules', module: 'schedule', action: 'create' },
    { name: 'schedule.edit', displayName: 'Edit Schedule', description: 'Edit class schedules', module: 'schedule', action: 'edit' },

    // Grade permissions
    { name: 'grades.view', displayName: 'View Grades', description: 'View student grades', module: 'grades', action: 'view' },
    { name: 'grades.create', displayName: 'Create Grades', description: 'Create student grades', module: 'grades', action: 'create' },
    { name: 'grades.edit', displayName: 'Edit Grades', description: 'Edit student grades', module: 'grades', action: 'edit' },

    // Financial permissions
    { name: 'financial.view', displayName: 'View Financial', description: 'View financial information', module: 'financial', action: 'view' },
    { name: 'financial.create', displayName: 'Create Financial', description: 'Create financial records', module: 'financial', action: 'create' },
    { name: 'financial.edit', displayName: 'Edit Financial', description: 'Edit financial records', module: 'financial', action: 'edit' },
  ];

  for (const permission of permissionData) {
    const createdPermission = await prisma.permission.create({
      data: permission,
    });
    permissions.push(createdPermission);
  }

  return permissions;
}

async function createRolePermissions(roles, permissions) {
  console.log('🔗 Creating role permissions...');

  const rolePermissionMap = {
    admin: permissions.map(p => p.name), // Admin gets all permissions
    manager: permissions.filter(p => !p.name.includes('delete')).map(p => p.name), // Manager gets all except delete
    teacher: permissions.filter(p =>
      p.name.includes('classes') ||
      p.name.includes('schedule') ||
      p.name.includes('grades') ||
      p.name.includes('students.view')
    ).map(p => p.name),
    student: permissions.filter(p =>
      p.name.includes('grades.view') ||
      p.name.includes('schedule.view')
    ).map(p => p.name),
    parent: permissions.filter(p =>
      p.name.includes('grades.view') ||
      p.name.includes('schedule.view') ||
      p.name.includes('students.view')
    ).map(p => p.name),
  };

  for (const role of roles) {
    const permissionNames = rolePermissionMap[role.name] || [];
    const rolePermissions = permissions.filter(p => permissionNames.includes(p.name));

    for (const permission of rolePermissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }
}

async function createStudentParentRelationships(students, parents) {
  console.log('🔗 Creating student-parent relationships...');

  for (let i = 0; i < Math.min(students.length, parents.length); i++) {
    // Update student with parentId instead of creating separate relationship
    await prisma.student.update({
      where: { id: students[i].id },
      data: {
        parentId: parents[i].id,
      },
    });
  }
}

async function createClasses(subjects, rooms) { // Bỏ teachers parameter
  console.log('📖 Creating classes...');
  const classes = [];

  for (let i = 0; i < NUM_CLASSES; i++) {
    const subject = faker.helpers.arrayElement(subjects);
    const room = faker.helpers.arrayElement(rooms);
    const grade = faker.helpers.arrayElement(GRADE_LEVELS);

    const newClass = await prisma.class.create({
      data: {
        name: `${subject.name} ${grade}${String.fromCharCode(65 + (i % 3))}`,
        grade: grade,
        subjectId: subject.id,
        roomId: room.id,
        maxStudents: faker.number.int({ min: 20, max: 40 }),
        status: faker.helpers.arrayElement(['draft', 'active', 'completed']),
        description: faker.lorem.sentence(),
      },
    });
    classes.push(newClass);
  }

  return classes;
}

// THÊM hàm tạo TeacherAssignments
async function createTeacherAssignments(teachers, classes, academicYears) {
  console.log('🔗 Creating teacher assignments...');
  const assignments = [];

  // Tạo các kỳ học và năm học
  const semesters = ['2024-1', '2024-2', '2025-1'];
  const availableAcademicYears = academicYears.map(ay => ay.year); // SỬA dòng này

  for (const classItem of classes) {
    // Mỗi lớp sẽ có ít nhất 1 assignment, có thể có nhiều assignment qua các kỳ
    const numAssignments = faker.number.int({ min: 1, max: 3 });

    let currentStartDate = faker.date.between({
      from: '2024-09-01',
      to: '2024-09-15'
    });

    for (let i = 0; i < numAssignments; i++) {
      // Chọn giáo viên phù hợp với môn học của lớp
      const classWithSubject = await prisma.class.findUnique({
        where: { id: classItem.id },
        include: { subject: true }
      });

      const suitableTeachers = teachers.filter(teacher =>
        teacher.subjects.includes(classWithSubject.subject.name) ||
        teacher.subjects.length === 0 // Giáo viên đa năng
      );

      const teacher = suitableTeachers.length > 0
        ? faker.helpers.arrayElement(suitableTeachers)
        : faker.helpers.arrayElement(teachers);

      // Tính toán thời gian assignment
      const assignmentDuration = faker.number.int({ min: 60, max: 120 }); // 60-120 ngày
      const endDate = new Date(currentStartDate);
      endDate.setDate(endDate.getDate() + assignmentDuration);

      // Xác định trạng thái
      const now = new Date();
      let status;
      if (i === numAssignments - 1) {
        // Assignment cuối cùng
        status = endDate > now ? 'active' : 'completed';
      } else {
        status = 'completed';
      }

      const semester = faker.helpers.arrayElement(semesters);
      const academicYear = faker.helpers.arrayElement(availableAcademicYears); // SỬA dòng này

      // Check if assignment already exists
      const existingAssignment = await prisma.teacherClassAssignment.findFirst({
        where: {
          teacherId: teacher.id,
          classId: classItem.id,
          semester: semester,
          academicYear: academicYear,
        },
      });

      if (existingAssignment) {
        console.log(`⚠️  Assignment already exists for teacher ${teacher.id} and class ${classItem.id}`);
        continue;
      }

      const assignment = await prisma.teacherClassAssignment.create({
        data: {
          teacherId: teacher.id,
          classId: classItem.id,
          startDate: currentStartDate,
          endDate: status === 'completed' ? endDate : null,
          status: status,
          semester: semester,
          academicYear: academicYear, // SỬA dòng này
          recurringSchedule: {
            days: faker.helpers.arrayElements(
              ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
              faker.number.int({ min: 1, max: 3 })
            ),
            startTime: faker.helpers.arrayElement(['07:00', '08:00', '14:00', '15:00']),
            endTime: faker.helpers.arrayElement(['09:00', '10:00', '16:00', '17:00'])
          },
          notes: faker.helpers.maybe(() =>
            faker.helpers.arrayElement([
              'Phân công thường kỳ',
              'Thay thế giáo viên nghỉ phép',
              'Tăng cường giảng dạy',
              'Phân công mới học kỳ',
              'Hỗ trợ giảng dạy'
            ])
          ),
        },
      });

      assignments.push(assignment);

      // Cập nhật start date cho assignment tiếp theo
      currentStartDate = new Date(endDate);
      currentStartDate.setDate(currentStartDate.getDate() + 1);

      // Nếu đã quá xa trong tương lai thì dừng
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      if (currentStartDate >= maxDate) {
        break;
      }
    }
  }

  // Tạo thêm assignments cho giáo viên chưa có lớp
  await createAdditionalTeacherAssignments(teachers, classes, assignments, availableAcademicYears); // THÊM parameter

  console.log(`✅ Created ${assignments.length} teacher assignments`);
  return assignments;
}

// CẬP NHẬT hàm createAdditionalTeacherAssignments
async function createAdditionalTeacherAssignments(teachers, classes, existingAssignments, availableAcademicYears) {
  console.log('➕ Creating additional teacher assignments for unassigned teachers...');

  // Tìm giáo viên chưa có assignment
  const assignedTeacherIds = new Set(existingAssignments.map(a => a.teacherId));
  const unassignedTeachers = teachers.filter(t => !assignedTeacherIds.has(t.id));

  for (const teacher of unassignedTeachers) {
    // Tìm lớp chưa có giáo viên active
    const classesWithActiveAssignments = new Set(
      existingAssignments
        .filter(a => a.status === 'active')
        .map(a => a.classId)
    );

    const availableClasses = classes.filter(cls =>
      !classesWithActiveAssignments.has(cls.id)
    );

    if (availableClasses.length > 0) {
      const selectedClass = faker.helpers.arrayElement(availableClasses);

      const assignment = await prisma.teacherClassAssignment.create({
        data: {
          teacherId: teacher.id,
          classId: selectedClass.id,
          startDate: faker.date.between({
            from: '2024-09-01',
            to: '2024-09-30'
          }),
          endDate: null,
          status: 'active',
          semester: '2024-2',
          academicYear: availableAcademicYears[1], // SỬA: sử dụng active academic year
          recurringSchedule: {
            days: faker.helpers.arrayElements(
              ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
              faker.number.int({ min: 1, max: 3 })
            ),
            startTime: faker.helpers.arrayElement(['07:00', '08:00', '14:00', '15:00']),
            endTime: faker.helpers.arrayElement(['09:00', '10:00', '16:00', '17:00'])
          },
          notes: 'Auto-assigned to unassigned teacher',
        },
      });

      existingAssignments.push(assignment);
      console.log(`📌 Assigned teacher ${teacher.id} to class ${selectedClass.id}`);
    }
  }
}

// CẬP NHẬT hàm createEnrollments để kết nối với assignments
async function createEnrollments(students, classes, assignments) {
  console.log('📝 Creating enrollments...');

  for (const student of students) {
    const numClasses = faker.number.int({ min: 1, max: 3 });
    const selectedClasses = faker.helpers.arrayElements(classes, numClasses);

    for (const classItem of selectedClasses) {
      // Tìm teacher assignment cho class này
      const assignment = assignments.find(a =>
        a.classId === classItem.id && a.status === 'active'
      );

      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          classId: classItem.id,
          status: faker.helpers.arrayElement(['active', 'completed', 'dropped']),
          semester: assignment?.semester || '2024-2', // THÊM field này
          teacherClassAssignmentId: assignment?.id || null, // THÊM field này để kết nối
          enrolledAt: faker.date.between({
            from: '2024-09-01',
            to: new Date()
          }) // THÊM field này nếu có trong schema
        },
      });
    }
  }
}

// CẬP NHẬT hàm createClassSessions để thêm academicYear
async function createClassSessions(classes, academicYears) {
  console.log('📅 Creating class sessions...');
  const sessions = [];

  const availableAcademicYears = academicYears.map(ay => ay.year); // THÊM dòng này

  for (let i = 0; i < NUM_SESSIONS; i++) {
    const classItem = faker.helpers.arrayElement(classes);
    const academicYear = faker.helpers.arrayElement(availableAcademicYears); // THÊM dòng này

    // Tạo session date trong khoảng thời gian của academic year được chọn
    const selectedAcademicYear = academicYears.find(ay => ay.year === academicYear); // THÊM dòng này
    const sessionDate = faker.date.between({
      from: selectedAcademicYear.startDate,
      to: selectedAcademicYear.endDate
    }); // SỬA sessionDate

    const session = await prisma.classSession.create({
      data: {
        classId: classItem.id,
        academicYear: academicYear, // THÊM field này
        sessionDate: sessionDate, // SỬA field này
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

    // Get active teacher assignment for this class
    const activeAssignment = await prisma.teacherClassAssignment.findFirst({
      where: {
        classId: session.classId,
        status: 'active'
      },
      include: {
        teacher: {
          include: { user: true }
        }
      }
    });

    if (!activeAssignment || !activeAssignment.teacher) continue;

    for (const enrollment of enrollments) {
      await prisma.studentSessionAttendance.create({
        data: {
          sessionId: session.id,
          studentId: enrollment.student.id,
          status: faker.helpers.arrayElement(['present', 'absent', 'late', 'excused']),
          note: faker.lorem.sentence(),
          recordedBy: activeAssignment.teacher.user.id,
        },
      });
    }
  }
}

async function createAssessments(classes, assignments) {
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

async function createGrades(assessments, students, assignments) {
  console.log('📈 Creating grades...');

  for (const assessment of assessments) {
    // Get students enrolled in this class
    const enrollments = await prisma.enrollment.findMany({
      where: { classId: assessment.classId },
      include: { student: true }
    });

    // Get active teacher assignment for this class
    const activeAssignment = assignments.find(a =>
      a.classId === assessment.classId && a.status === 'active'
    );

    if (!activeAssignment) continue;

    // Get teacher user
    const teacher = await prisma.teacher.findUnique({
      where: { id: activeAssignment.teacherId },
      include: { user: true }
    });

    if (!teacher) continue;

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
          gradedBy: teacher.user.id,
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

// Additional Data Functions
async function createAlerts() {
  console.log('🚨 Creating alerts...');

  const alertTypes = ['system_error', 'low_attendance', 'payment_overdue', 'schedule_conflict', 'grade_anomaly'];
  const severities = ['low', 'medium', 'high', 'critical'];

  for (let i = 0; i < NUM_ALERTS; i++) {
    await prisma.alert.create({
      data: {
        alertType: faker.helpers.arrayElement(alertTypes),
        title: faker.lorem.sentence(),
        message: faker.lorem.paragraph(),
        severity: faker.helpers.arrayElement(severities),
        payload: {
          source: faker.helpers.arrayElement(['system', 'user', 'automated']),
          metadata: {
            timestamp: faker.date.recent(),
            userId: faker.string.uuid(),
            additionalInfo: faker.lorem.sentence()
          }
        },
        processed: faker.datatype.boolean({ probability: 0.7 }),
        processedAt: faker.datatype.boolean({ probability: 0.7 }) ? faker.date.recent() : null,
      },
    });
  }
}

async function createScheduleChanges(classes, rooms) {
  console.log('📅 Creating schedule changes...');

  for (let i = 0; i < NUM_SCHEDULE_CHANGES; i++) {
    const classItem = faker.helpers.arrayElement(classes);
    const originalDate = faker.date.future();
    const newDate = faker.date.future();

    await prisma.scheduleChange.create({
      data: {
        classId: classItem.id,
        originalDate: originalDate,
        originalTime: faker.helpers.arrayElement(['07:00', '08:00', '14:00', '15:00']),
        newDate: newDate,
        newTime: faker.helpers.arrayElement(['07:00', '08:00', '14:00', '15:00']),
        newRoomId: faker.datatype.boolean({ probability: 0.5 }) ? faker.helpers.arrayElement(rooms).id : null,
        reason: faker.helpers.arrayElement([
          'Room maintenance',
          'Teacher unavailable',
          'Holiday adjustment',
          'Student request',
          'Weather conditions'
        ]),
        status: faker.helpers.arrayElement(['pending', 'approved', 'rejected']),
        requestedBy: faker.string.uuid(),
        requestedAt: faker.date.recent(),
        processedAt: faker.datatype.boolean({ probability: 0.6 }) ? faker.date.recent() : null,
      },
    });
  }
}

async function createUserSessions(teachers, students, parents, adminUser) {
  console.log('🔐 Creating user sessions...');

  const allUsers = [
    ...teachers.map(t => ({ id: t.userId, role: 'teacher' })),
    ...students.map(s => ({ id: s.userId, role: 'student' })),
    ...parents.map(p => ({ id: p.userId, role: 'parent' })),
    { id: adminUser.id, role: 'admin' }
  ];

  for (const user of allUsers) {
    // Create 1-3 sessions per user
    const numSessions = faker.number.int({ min: 1, max: 3 });

    for (let i = 0; i < numSessions; i++) {
      const expiresAt = faker.date.future({ years: 1 });

      await prisma.userSession.create({
        data: {
          userId: user.id,
          refreshToken: faker.string.alphanumeric(64),
          expiresAt: expiresAt,
          isActive: faker.datatype.boolean({ probability: 0.8 }),
        },
      });
    }
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
    prisma.teacherClassAssignment.count(),
    prisma.enrollment.count(),
    prisma.assessment.count(),
    prisma.studentAssessmentGrade.count(),
    prisma.feeRecord.count(),
    prisma.payment.count(),
    prisma.role.count(),
    prisma.permission.count(),
    prisma.rolePermission.count(),
    prisma.alert.count(),
    prisma.scheduleChange.count(),
    prisma.userSession.count(),
    prisma.academicYear.count(), // THÊM dòng này
  ]);

  console.log(`🏫 Schools: ${counts[0]}`);
  console.log(`👨‍🏫 Teachers: ${counts[1]}`);
  console.log(`👨‍🎓 Students: ${counts[2]}`);
  console.log(`👨‍👩‍👧‍👦 Parents: ${counts[3]}`);
  console.log(`📖 Classes: ${counts[4]}`);
  console.log(`🔗 Teacher Assignments: ${counts[5]}`);
  console.log(`📝 Enrollments: ${counts[6]}`);
  console.log(`📊 Assessments: ${counts[7]}`);
  console.log(`📈 Grades: ${counts[8]}`);
  console.log(`💰 Fee Records: ${counts[9]}`);
  console.log(`💳 Payments: ${counts[10]}`);
  console.log(`🔐 Roles: ${counts[11]}`);
  console.log(`🔑 Permissions: ${counts[12]}`);
  console.log(`🔗 Role Permissions: ${counts[13]}`);
  console.log(`🚨 Alerts: ${counts[14]}`);
  console.log(`📅 Schedule Changes: ${counts[15]}`);
  console.log(`🔐 User Sessions: ${counts[16]}`);
  console.log(`📅 Academic Years: ${counts[17]}`); // THÊM dòng này
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });