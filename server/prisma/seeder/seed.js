// seed.js
const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const NUM_USERS = 50;
const NUM_TEACHERS = 5;
const NUM_STUDENTS = 45;
const NUM_SCHOOLS = 2;
const NUM_SUBJECTS = 5;
const NUM_CLASSES = 10;
const NUM_SESSIONS = 50;

async function main() {
  console.log('Seeding database...');
  
  // Clear existing data for a clean slate
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.feeRecord.deleteMany(),
    prisma.feeStructure.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.grade.deleteMany(),
    prisma.assessment.deleteMany(),
    prisma.material.deleteMany(),
    prisma.classRequest.deleteMany(),
    prisma.classSession.deleteMany(),
    prisma.class.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.studentParentLink.deleteMany(),
    prisma.student.deleteMany(),
    prisma.parent.deleteMany(),
    prisma.teacher.deleteMany(),
    prisma.school.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create Schools
  const schools = [];
  for (let i = 0; i < NUM_SCHOOLS; i++) {
    const school = await prisma.school.create({
      data: {
        name: faker.company.name(),
        address: faker.location.streetAddress(),
        phone: faker.phone.number(),
      },
    });
    schools.push(school);
  }

  // Create Users (with a mix of roles)
  const users = [];
  const roles = ['admin', 'teacher', 'parent_student'];
  
  // Create admin user first
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      fullName: 'Administrator',
      role: 'admin',
      phone: '0123456789',
    },
  });
  users.push(adminUser);

  // Create teacher users
  for (let i = 0; i < NUM_TEACHERS; i++) {
    const user = await prisma.user.create({
      data: {
        username: `teacher${i + 1}`,
        email: `teacher${i + 1}@example.com`,
        password: await bcrypt.hash('teacher123', 10),
        fullName: faker.person.fullName(),
        role: 'teacher',
        phone: faker.phone.number(),
      },
    });
    users.push(user);
  }

  // Create student/parent users
  for (let i = 0; i < NUM_STUDENTS; i++) {
    const user = await prisma.user.create({
      data: {
        username: `student${i + 1}`,
        email: `student${i + 1}@example.com`,
        password: await bcrypt.hash('student123', 10),
        fullName: faker.person.fullName(),
        role: 'parent_student',
        phone: faker.phone.number(),
      },
    });
    users.push(user);
  }

  // Create Teachers
  const teachers = [];
  const teacherUsers = users.filter(u => u.role === 'teacher');
  for (let i = 0; i < teacherUsers.length; i++) {
    const teacherUser = teacherUsers[i];
    const teacher = await prisma.teacher.create({
      data: {
        userId: teacherUser.id,
        hireDate: faker.date.past(),
        contractEnd: faker.date.future({ years: 2 }),
        subjects: faker.helpers.arrayElements(['Toán', 'Lý', 'Hóa', 'Văn', 'Anh'], faker.helpers.arrayElement([1, 2, 3])),
        salary: parseFloat(faker.finance.amount({ min: 1000, max: 5000, dec: 2 })),
        gender: faker.helpers.arrayElement(['Nam', 'Nữ', 'Khác']),
        birthDate: faker.date.birthdate({ min: 1980, max: 1995, mode: 'year' }),
      },
    });
    teachers.push(teacher);
  }

  // Create Students
  const students = [];
  const studentUsers = users.filter(u => u.role === 'parent_student');
  for (let i = 0; i < studentUsers.length; i++) {
    const studentUser = studentUsers[i];
    const student = await prisma.student.create({
      data: {
        userId: studentUser.id,
        studentCode: `STU${String(i + 1).padStart(3, '0')}`,
        dateOfBirth: faker.date.birthdate({ min: 1995, max: 2010, mode: 'year' }),
        gender: faker.person.sex(),
        address: faker.location.streetAddress(),
        grade: `Lớp ${faker.helpers.arrayElement([10, 11, 12])}`,
        schoolId: faker.helpers.arrayElement(schools).id,
      },
    });
    students.push(student);
  }

  // Create Parents and link with Students
  const parents = [];
  for (let i = 0; i < Math.min(students.length, 20); i++) { // Tạo 20 parents
    const parentUser = await prisma.user.create({
      data: {
        username: `parent${i + 1}`,
        email: `parent${i + 1}@example.com`,
        password: await bcrypt.hash('parent123', 10),
        fullName: faker.person.fullName(),
        role: 'parent_student',
        phone: faker.phone.number(),
      },
    });

    const parent = await prisma.parent.create({
      data: {
        userId: parentUser.id,
      },
    });
    parents.push(parent);

    // Link parent with student
    const student = students[i];
    await prisma.studentParentLink.create({
      data: {
        studentId: student.id,
        parentId: parent.id,
        relation: faker.helpers.arrayElement(['father', 'mother', 'guardian']),
        primaryContact: true,
      },
    });
  }

  // Create Subjects
  const subjects = [];
  const subjectNames = ['Toán học', 'Vật lý', 'Hóa học', 'Ngữ văn', 'Tiếng Anh'];
  const subjectCodes = ['TOAN', 'LY', 'HOA', 'VAN', 'ANH'];
  for (let i = 0; i < NUM_SUBJECTS; i++) {
    const subject = await prisma.subject.create({
      data: {
        name: subjectNames[i],
        code: subjectCodes[i],
        description: faker.lorem.sentence(),
      },
    });
    subjects.push(subject);
  }
  
  // Create Rooms
  const rooms = [];
  for (let i = 0; i < 5; i++) {
    const room = await prisma.room.create({
      data: {
        name: `Phòng ${101 + i}`,
        capacity: faker.number.int({ min: 20, max: 50 }),
        equipment: {
          projector: faker.datatype.boolean(),
          whiteboard: true,
          airConditioner: faker.datatype.boolean(),
        },
      },
    });
    rooms.push(room);
  }

  // Create Classes
  const classes = [];
  const classGrades = ['Lớp 10', 'Lớp 11', 'Lớp 12'];
  for (let i = 0; i < NUM_CLASSES; i++) {
    const teacher = faker.helpers.arrayElement(teachers);
    const subject = faker.helpers.arrayElement(subjects);
    const room = faker.helpers.arrayElement(rooms);
    const newClass = await prisma.class.create({
      data: {
        name: `Lớp ${subject.name.split(' ')[0]} ${classGrades[i % 3]}${String.fromCharCode(65 + i)}`,
        grade: classGrades[i % 3],
        subjectId: subject.id,
        teacherId: teacher.id,
        roomId: room.id,
        maxStudents: faker.number.int({ min: 20, max: 40 }),
        startDate: faker.date.future({ years: 0.5 }),
        endDate: faker.date.future({ years: 1 }),
        recurringSchedule: {
          days: faker.helpers.arrayElements(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], 2),
          startTime: '14:00',
          endTime: '16:00'
        },
        status: 'active',
        description: faker.lorem.sentence(),
      },
    });
    classes.push(newClass);
  }

  // Create Enrollments
  for (const student of students) {
    const classToEnroll = faker.helpers.arrayElement(classes);
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        classId: classToEnroll.id,
      },
    });
  }
  
  // Create Class Sessions and Attendances
  const enrollments = await prisma.enrollment.findMany();
  for (let i = 0; i < NUM_SESSIONS; i++) {
    const classToSession = faker.helpers.arrayElement(classes);
    const sessionDate = faker.date.recent({ days: 30 });
    const session = await prisma.classSession.create({
      data: {
        classId: classToSession.id,
        sessionDate: sessionDate,
        startTime: '14:00',
        endTime: '16:00',
      },
    });

    const enrolledStudents = enrollments.filter(e => e.classId === classToSession.id);
    const validRecorders = users.filter(u => u.role === 'teacher' || u.role === 'admin');
    
    for (const enrollment of enrolledStudents) {
      if (validRecorders.length === 0) {
        console.log('No valid recorders available, skipping attendance record');
        continue;
      }
      
      await prisma.attendance.create({
        data: {
          sessionId: session.id,
          studentId: enrollment.studentId,
          status: faker.helpers.arrayElement(['present', 'absent', 'late', 'excused']),
          note: faker.lorem.sentence(),
          recordedBy: faker.helpers.arrayElement(validRecorders).id,
        },
      });
    }
  }

  // Create Fee Structures and Records
  const feeStructures = [];
  for (const cls of classes) {
    const fee = await prisma.feeStructure.create({
      data: {
        name: `Học phí ${cls.name}`,
        amount: parseFloat(faker.finance.amount({ min: 50, max: 200, dec: 2 })),
        period: faker.helpers.arrayElement(['monthly', 'semester']),
      },
    });
    feeStructures.push(fee);
    await prisma.class.update({
      where: { id: cls.id },
      data: { feeStructureId: fee.id }
    });
  }

  for (const student of students) {
    const feeStructure = faker.helpers.arrayElement(feeStructures);
    await prisma.feeRecord.create({
      data: {
        studentId: student.id,
        feeStructureId: feeStructure.id,
        amount: feeStructure.amount,
        dueDate: faker.date.future({ years: 1 }),
        status: faker.helpers.arrayElement(['pending', 'paid', 'overdue']),
      },
    });
  }

  // Create some contracts for teachers
  for (const teacher of teachers) {
    await prisma.contract.create({
      data: {
        teacherId: teacher.id,
        startDate: faker.date.past(),
        endDate: faker.date.future({ years: 1 }),
        salary: teacher.salary,
        status: 'active',
        terms: {
          workingHours: '40 hours/week',
          benefits: ['Health insurance', 'Paid leave'],
        },
      },
    });
  }

  // Create some payrolls
  for (const teacher of teachers) {
    for (let i = 0; i < 3; i++) {
      const baseSalary = parseFloat(teacher.salary);
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
        },
      });
    }
  }

  // Create Assessments
  console.log('Creating assessments...');
  const assessments = [];
  for (let i = 0; i < 20; i++) {
    const assessment = await prisma.assessment.create({
      data: {
        name: faker.helpers.arrayElement(['Kiểm tra 15 phút', 'Kiểm tra 1 tiết', 'Thi giữa kỳ', 'Thi cuối kỳ']),
        description: faker.lorem.sentence(),
        type: faker.helpers.arrayElement(['15_min', '45_min', 'homework', 'midterm', 'final']),
        maxScore: faker.helpers.arrayElement([10, 15, 20, 100]),
        date: faker.date.recent({ days: 30 }),
        classId: faker.helpers.arrayElement(classes).id,
        createdAt: faker.date.past(),
      },
    });
    assessments.push(assessment);
  }

  // Create Grades
  console.log('Creating grades...');
  for (const assessment of assessments) {
    // Get students enrolled in this class
    const enrolledStudents = await prisma.enrollment.findMany({
      where: { classId: assessment.classId },
      include: { student: true }
    });
    
    // Randomly select some students to take the assessment (80% chance)
    const studentsToGrade = enrolledStudents.filter(() => faker.datatype.boolean({ probability: 0.8 }));
    
    // Get a valid teacher ID for grading (use the class teacher or any teacher)
    const classTeacher = await prisma.class.findUnique({
      where: { id: assessment.classId },
      select: { teacherId: true }
    });
    
    // Fallback to any teacher if class teacher not found
    const teacherForGrading = classTeacher?.teacherId || (teachers.length > 0 ? teachers[0].id : null);
    
    if (!teacherForGrading) {
      console.log('No teacher available for grading, skipping grades for this assessment');
      continue;
    }
    
    for (const enrollment of studentsToGrade) {
      const score = faker.number.float({ 
        min: 0, 
        max: parseFloat(assessment.maxScore), 
        fractionDigits: 1 
      });
      
      await prisma.grade.create({
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
          gradedBy: teacherForGrading,
          gradedAt: faker.date.between({ 
            from: assessment.date, 
            to: new Date(assessment.date.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 ngày sau assessment.date
          }),
        },
      });
    }
  }

  const gradeCount = await prisma.grade.count();
  const assessmentCount = await prisma.assessment.count();
  
  console.log('Seeding complete! ✅');
  console.log(`Created ${assessmentCount} assessments`);
  console.log(`Created ${gradeCount} grades`);

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });