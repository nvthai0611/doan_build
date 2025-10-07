const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

// Constants
const NUM_SCHOOLS = 3;
const NUM_SUBJECTS = 5;
const NUM_TEACHERS = 15;
const NUM_STUDENTS = 100;
const NUM_PARENTS = 80;
const NUM_CLASSES = 25;

async function main() {
  console.log('🌱 Starting database seeding (without rooms)...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.contractExpiryNotification.deleteMany();
    await prisma.contractUpload.deleteMany();
    await prisma.contractTemplate.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.feeRecord.deleteMany();
    await prisma.feeStructure.deleteMany();
    await prisma.studentAssessmentGrade.deleteMany();
    await prisma.assessment.deleteMany();
    await prisma.studentSessionAttendance.deleteMany();
    await prisma.classSession.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.teacherClassAssignment.deleteMany();
    await prisma.class.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.student.deleteMany();
    await prisma.parent.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.school.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.user.deleteMany();

    // Create schools
    console.log('🏫 Creating schools...');
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

    // Create subjects
    console.log('📚 Creating subjects...');
    const subjects = [];
    const subjectNames = ['Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Tiếng Anh'];
    for (let i = 0; i < NUM_SUBJECTS; i++) {
      const subject = await prisma.subject.create({
        data: {
          name: subjectNames[i],
          code: subjectNames[i].substring(0, 3).toUpperCase(),
          description: `Môn ${subjectNames[i]} cơ bản`,
        },
      });
      subjects.push(subject);
    }

    // Create roles and permissions
    console.log('🔐 Creating roles...');
    const roles = [
      { name: 'center_owner', displayName: 'Chủ trung tâm', description: 'Có toàn quyền quản lý trung tâm' },
      { name: 'teacher', displayName: 'Giáo viên', description: 'Quyền hạn của giáo viên' },
      { name: 'admin', displayName: 'Quản trị viên', description: 'Quyền hạn quản trị hệ thống' },
      { name: 'student', displayName: 'Học sinh', description: 'Quyền hạn của học sinh' },
      { name: 'parent', displayName: 'Phụ huynh', description: 'Quyền hạn của phụ huynh' }
    ];

    const createdRoles = {};
    for (const roleData of roles) {
      const role = await prisma.role.create({
        data: roleData
      });
      createdRoles[role.name] = role;
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('123456', 10);
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@qne.edu.vn',
        password: hashedPassword,
        fullName: 'Admin System',
        username: 'admin_system',
        role: 'admin',
        phone: '0111222333',
        isActive: true,
        roleId: createdRoles.admin.id,
      },
    });

    // Create teachers
    console.log('👨‍🏫 Creating teachers...');
    const teachers = [];
    for (let i = 0; i < NUM_TEACHERS; i++) {
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: hashedPassword,
          fullName: faker.person.fullName(),
          username: faker.internet.userName(),
          role: 'teacher',
          phone: faker.phone.number(),
          isActive: true,
          roleId: createdRoles.teacher.id,
        },
      });

      const teacher = await prisma.teacher.create({
        data: {
          userId: user.id,
          subjects: [faker.helpers.arrayElement(['Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Tiếng Anh'])],
          schoolId: faker.helpers.arrayElement(schools).id,
          hireDate: faker.date.past(),
          salary: faker.number.int({ min: 5000000, max: 15000000 }),
          birthDate: faker.date.birthdate({ min: 25, max: 60, mode: 'age' }),
          gender: faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER']),
        },
      });
      teachers.push(teacher);
    }

    // Create parents
    console.log('👨‍👩‍👧‍👦 Creating parents...');
    const parents = [];
    for (let i = 0; i < NUM_PARENTS; i++) {
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: hashedPassword,
          fullName: faker.person.fullName(),
          username: faker.internet.userName(),
          role: 'parent',
          phone: faker.phone.number(),
          isActive: true,
          roleId: createdRoles.parent.id,
        },
      });

      const parent = await prisma.parent.create({
        data: {
          userId: user.id,
        },
      });
      parents.push(parent);
    }

    // Create students
    console.log('👨‍🎓 Creating students...');
    const students = [];
    for (let i = 0; i < NUM_STUDENTS; i++) {
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: hashedPassword,
          fullName: faker.person.fullName(),
          username: faker.internet.userName(),
          role: 'student',
          phone: faker.phone.number(),
          isActive: true,
          roleId: createdRoles.student.id,
        },
      });

      const student = await prisma.student.create({
        data: {
          userId: user.id,
          studentCode: `S${String(i + 1).padStart(3, '0')}`,
          grade: faker.helpers.arrayElement(['6', '7', '8', '9']),
          schoolId: faker.helpers.arrayElement(schools).id,
          parentId: faker.helpers.arrayElement(parents).id,
          birthDate: faker.date.birthdate({ min: 12, max: 18, mode: 'age' }),
          gender: faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER']),
          address: faker.location.streetAddress(),
        },
      });
      students.push(student);
    }

    // Create classes
    console.log('📖 Creating classes...');
    const classes = [];
    for (let i = 0; i < NUM_CLASSES; i++) {
      const classItem = await prisma.class.create({
        data: {
          name: `Lớp ${faker.helpers.arrayElement(['6A', '6B', '7A', '7B', '8A', '8B', '9A', '9B'])}`,
          description: `Lớp học ${faker.helpers.arrayElement(['Toán', 'Lý', 'Hóa', 'Sinh', 'Anh'])}`,
          maxStudents: faker.number.int({ min: 20, max: 40 }),
          subjectId: faker.helpers.arrayElement(subjects).id,
          grade: faker.helpers.arrayElement(['6', '7', '8', '9']),
          status: faker.helpers.arrayElement(['draft', 'active', 'completed']),
        },
      });
      classes.push(classItem);
    }

    // Create teacher assignments
    console.log('🔗 Creating teacher assignments...');
    for (const classItem of classes) {
      const teacher = faker.helpers.arrayElement(teachers);
      await prisma.teacherClassAssignment.create({
        data: {
          teacherId: teacher.id,
          classId: classItem.id,
          semester: faker.helpers.arrayElement(['Học kỳ 1', 'Học kỳ 2']),
          academicYear: '2024-2025',
          startDate: faker.date.past(),
          endDate: faker.date.future(),
          maxStudents: faker.number.int({ min: 20, max: 40 }),
          currentStudents: faker.number.int({ min: 0, max: 30 }),
        },
      });
    }

    // Create enrollments
    console.log('📝 Creating enrollments...');
    for (let i = 0; i < Math.floor(NUM_STUDENTS * 2); i++) {
      const student = faker.helpers.arrayElement(students);
      const classItem = faker.helpers.arrayElement(classes);
      
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          classId: classItem.id,
          enrolledAt: faker.date.past(),
          status: faker.helpers.arrayElement(['active', 'completed', 'dropped']),
          semester: faker.helpers.arrayElement(['Học kỳ 1', 'Học kỳ 2']),
        },
      });
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   Schools: ${schools.length}`);
    console.log(`   Subjects: ${subjects.length}`);
    console.log(`   Teachers: ${teachers.length}`);
    console.log(`   Students: ${students.length}`);
    console.log(`   Parents: ${parents.length}`);
    console.log(`   Classes: ${classes.length}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
