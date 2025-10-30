const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

/**
 * ============================================================================
 * SEED DATABASE - Hệ thống quản lý trung tâm giáo dục THCS
 * ============================================================================
 * 
 * File này tạo dữ liệu mẫu chuẩn cho hệ thống, bao gồm:
 * - 2 trường THCS
 * - 10 giáo viên
 * - 30 học sinh (lớp 6-9)
 * - 20 phụ huynh
 * - 6 môn học (Toán, Lý, Hóa, Văn, Sử, Anh)
 * - Các lớp học với nhiều trạng thái khác nhau
 * - Buổi học, điểm danh, điểm số, học phí,...
 * 
 * ⚠️ Tất cả STATUS được đồng bộ với FRONTEND (client/src/lib/constants.ts)
 * ============================================================================
 */

// Configuration - Số lượng dữ liệu hợp lý
const CONFIG = {
  NUM_SCHOOLS: 2,
  NUM_TEACHERS: 10,
  NUM_STUDENTS: 30,
  NUM_PARENTS: 20,
  NUM_ROOMS: 5,
  NUM_CLASSES_PER_SUBJECT: 2, // Mỗi môn 2 lớp
};

// ==================== STATUS CONSTANTS ====================
// Class Status: draft, ready, active, completed, suspended, cancelled
const CLASS_STATUS = {
  DRAFT: 'draft',
  READY: 'ready',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled'
};

// Session Status (Frontend): happening, end, has_not_happened, day_off
const SESSION_STATUS = {
  HAPPENING: 'happening',
  END: 'end',
  HAS_NOT_HAPPENED: 'has_not_happened',
  DAY_OFF: 'day_off',
  TEACHER_ABSENT: 'teacher_absent',
};

// Enrollment Status (Frontend): not_been_updated, studying, stopped, graduated
const ENROLLMENT_STATUS = {
  NOT_BEEN_UPDATED: 'not_been_updated',
  STUDYING: 'studying',
  STOPPED: 'stopped',
  GRADUATED: 'graduated',
  WITHDRAWN: 'withdrawn',
};

// Fee Record Status
const FEE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

// Leave Request Status
const LEAVE_REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Student Class Request Status
const CLASS_REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Attendance Status
const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late'
};

// Năm học hiện tại
const CURRENT_ACADEMIC_YEAR = '2024-2025';
const ACADEMIC_YEAR_START = new Date('2024-09-01');
const ACADEMIC_YEAR_END = new Date('2025-06-30');

// Dữ liệu chuẩn cho môn học (THCS)
const SUBJECTS = [
  { name: 'Toán học', code: 'MATH', description: 'Môn Toán học THCS - Đại số và Hình học' },
  { name: 'Vật lý', code: 'PHYSICS', description: 'Môn Vật lý THCS - Cơ học, Nhiệt học, Điện học' },
  { name: 'Hóa học', code: 'CHEMISTRY', description: 'Môn Hóa học THCS - Hóa học cơ bản' },
  { name: 'Ngữ văn', code: 'LITERATURE', description: 'Môn Ngữ văn THCS - Văn học và Tiếng Việt' },
  { name: 'Lịch sử', code: 'HISTORY', description: 'Môn Lịch sử Việt Nam và Thế giới' },
  { name: 'Tiếng Anh', code: 'ENGLISH', description: 'Môn Tiếng Anh THCS - Giao tiếp và Ngữ pháp' }
];

// Dữ liệu chuẩn cho khối lớp
const GRADES = [
  { name: 'Lớp 6', level: 6, description: 'Lớp 6 - Trung học cơ sở' },
  { name: 'Lớp 7', level: 7, description: 'Lớp 7 - Trung học cơ sở' },
  { name: 'Lớp 8', level: 8, description: 'Lớp 8 - Trung học cơ sở' },
  { name: 'Lớp 9', level: 9, description: 'Lớp 9 - Trung học cơ sở' }
];

// Lịch học chuẩn (Thứ 2, 4, 6)
const STANDARD_SCHEDULES = {
  morning: [
    { day: 'monday', startTime: '07:00', endTime: '09:00' },
    { day: 'wednesday', startTime: '07:00', endTime: '09:00' },
    { day: 'friday', startTime: '07:00', endTime: '09:00' }
  ],
  afternoon: [
    { day: 'tuesday', startTime: '14:00', endTime: '16:00' },
    { day: 'thursday', startTime: '14:00', endTime: '16:00' },
    { day: 'saturday', startTime: '14:00', endTime: '16:00' }
  ],
  evening: [
    { day: 'monday', startTime: '18:00', endTime: '20:00' },
    { day: 'wednesday', startTime: '18:00', endTime: '20:00' },
    { day: 'friday', startTime: '18:00', endTime: '20:00' }
  ]
};

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu chuẩn...');

  try {
    // Clear database
    await clearDatabase();

    // Create core data
    const academicYears = await createAcademicYears();
    const schools = await createSchools();
    const subjects = await createSubjects();
    const grades = await createGrades();
    const rooms = await createRooms();

    // Create users
    const adminUser = await createAdminUser();
    const teachers = await createTeachers(schools, subjects);
    const parents = await createParents();
    const students = await createStudents(schools, parents);

    // Create academic structures
    const feeStructures = await createFeeStructures(subjects, grades);
    const classes = await createClasses(subjects, rooms, grades, teachers, feeStructures);
    
    // Create enrollments and sessions
    await createEnrollments(students, classes);
    await createClassSessions(classes);

    // Create financial data
    await createFeeRecords(students, classes);
    await createPayments(parents, students);

    // Create academic activities
    await createAssessments(classes);
    await createMaterials(classes, teachers);
    await createStudentAttendances(classes, students);
    await createStudentGrades(classes, students);

    // Create administrative data
    await createNotifications(adminUser);
    await createLeaveRequests(teachers, students);
    await createStudentClassRequests(students, classes);

    console.log('✅ Seed dữ liệu hoàn tất!');
    await printSummary();

  } catch (error) {
    console.error('❌ Lỗi khi seed:', error);
    throw error;
  }
}

async function clearDatabase() {
  console.log('🧹 Xóa dữ liệu cũ...');

  await prisma.$transaction([
    // Dependent tables first
    prisma.studentAssessmentGrade.deleteMany(),
    prisma.studentSessionAttendance.deleteMany(),
    prisma.studentClassRequest.deleteMany(),
    prisma.feeRecordPayment.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.feeRecord.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.assessment.deleteMany(),
    prisma.material.deleteMany(),
    prisma.classSession.deleteMany(),
    prisma.leaveRequestAffectedSession.deleteMany(),
    prisma.leaveRequest.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.class.deleteMany(),
    prisma.feeStructure.deleteMany(),
    prisma.room.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.grade.deleteMany(),
    prisma.academicYear.deleteMany(),
    prisma.student.deleteMany(),
    prisma.parent.deleteMany(),
    prisma.teacher.deleteMany(),
    prisma.school.deleteMany(),
    prisma.userSession.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function createAcademicYears() {
  console.log('📅 Tạo năm học...');
  
  const years = [
    {
      year: '2023-2024',
      startDate: new Date('2023-09-01'),
      endDate: new Date('2024-06-30'),
      isActive: false
    },
    {
      year: '2024-2025',
      startDate: ACADEMIC_YEAR_START,
      endDate: ACADEMIC_YEAR_END,
      isActive: true
    }
  ];

  const created = [];
  for (const year of years) {
    const academicYear = await prisma.academicYear.create({ data: year });
    created.push(academicYear);
  }

  return created;
}

async function createSchools() {
  console.log('🏫 Tạo trường học...');
  
  const schoolsData = [
    {
      name: 'Trung tâm Giáo dục THCS Excellence',
      address: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
      phone: '0283123456'
    },
    {
      name: 'Trung tâm Học THCS Elite',
      address: '456 Đường Lê Lợi, Quận 3, TP.HCM',
      phone: '0283654321'
    }
  ];

  const schools = [];
  for (const data of schoolsData) {
    const school = await prisma.school.create({ data });
    schools.push(school);
  }

  return schools;
}

async function createSubjects() {
  console.log('📚 Tạo môn học...');
  
  const subjects = [];
  for (const data of SUBJECTS) {
    const subject = await prisma.subject.create({ data });
    subjects.push(subject);
  }

  return subjects;
}

async function createGrades() {
  console.log('📚 Tạo khối lớp...');

  const grades = [];
  for (const data of GRADES) {
    const grade = await prisma.grade.create({
      data: { ...data, isActive: true }
    });
    grades.push(grade);
  }

  return grades;
}

async function createRooms() {
  console.log('🏢 Tạo phòng học...');

  const rooms = [];
  for (let i = 1; i <= CONFIG.NUM_ROOMS; i++) {
    const room = await prisma.room.create({
      data: {
        name: `Phòng ${100 + i}`,
        capacity: 30,
        equipment: {
          projector: true,
          whiteboard: true,
          airConditioner: true,
          computer: i <= 3
        },
        isActive: true
      }
    });
    rooms.push(room);
  }

  return rooms;
}

async function createAdminUser() {
  console.log('👤 Tạo tài khoản admin...');

  return await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@school.com',
      password: await bcrypt.hash('admin123', 10),
      fullName: 'Quản trị viên hệ thống',
      role: 'admin',
      phone: '0901234567',
      isActive: true,
      gender: 'MALE',
      birthDate: new Date('1985-01-01')
    }
  });
}

async function createTeachers(schools, subjects) {
  console.log('👨‍🏫 Tạo giáo viên...');
  
  const teacherNames = [
    'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung',
    'Hoàng Văn Em', 'Võ Thị Phượng', 'Đặng Văn Giang', 'Bùi Thị Hà',
    'Mai Văn Khoa', 'Đinh Thị Lan'
  ];

  const teachers = [];
  for (let i = 0; i < CONFIG.NUM_TEACHERS; i++) {
    const school = schools[i % schools.length];
    const teacherSubjects = [subjects[i % subjects.length].name];

    const user = await prisma.user.create({
      data: {
        username: `teacher${i + 1}`,
        email: `teacher${i + 1}@school.com`,
        password: await bcrypt.hash('teacher123', 10),
        fullName: teacherNames[i],
        role: 'teacher',
        phone: `090${String(i + 1).padStart(7, '0')}`,
        isActive: true,
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
        birthDate: new Date(1985 + (i % 10), i % 12, 1)
      }
    });

    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        teacherCode: `TCH${String(i + 1).padStart(4, '0')}`,
        schoolId: school.id,
        subjects: teacherSubjects
      }
    });

    teachers.push(teacher);
  }

  return teachers;
}

async function createParents() {
  console.log('👨‍👩‍👧‍👦 Tạo phụ huynh...');

  const parents = [];
  for (let i = 0; i < CONFIG.NUM_PARENTS; i++) {
    const user = await prisma.user.create({
      data: {
        username: `parent${i + 1}`,
        email: `parent${i + 1}@gmail.com`,
        password: await bcrypt.hash('parent123', 10),
        fullName: `Phụ huynh ${i + 1}`,
        role: 'parent',
        phone: `091${String(i + 1).padStart(7, '0')}`,
        isActive: true,
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
        birthDate: new Date(1975 + (i % 15), i % 12, 1)
      }
    });

    const parent = await prisma.parent.create({
      data: { userId: user.id }
    });

    parents.push(parent);
  }

  return parents;
}

async function createStudents(schools, parents) {
  console.log('👨‍🎓 Tạo học sinh...');
  
  const students = [];
  for (let i = 0; i < CONFIG.NUM_STUDENTS; i++) {
    const school = schools[i % schools.length];
    const parent = i < parents.length ? parents[i] : null;
    const gradeLevel = 6 + (i % 4); // Lớp 6, 7, 8, 9
    
    const user = await prisma.user.create({
      data: {
        username: `student${i + 1}`,
        email: `student${i + 1}@gmail.com`,
        password: await bcrypt.hash('student123', 10),
        fullName: `Học sinh ${i + 1}`,
        role: 'student',
        phone: `092${String(i + 1).padStart(7, '0')}`,
        isActive: true,
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
        birthDate: new Date(2010 + (i % 4), i % 12, 1) // Sinh 2010-2013 (11-14 tuổi)
      }
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        studentCode: `STU${String(i + 1).padStart(4, '0')}`,
        schoolId: school.id,
        parentId: parent?.id,
        grade: `${gradeLevel}`,
        address: `${i + 1} Đường ABC, Quận ${(i % 12) + 1}, TP.HCM`
      }
    });

    students.push(student);
  }

  return students;
}

async function createFeeStructures(subjects, grades) {
  console.log('💰 Tạo cấu trúc học phí...');
  
  const feeStructures = [];
  
  // Tạo fee structure cho từng tổ hợp môn-khối
  for (const grade of grades) {
    for (const subject of subjects) {
      const baseFee = 800000; // 800k VNĐ base cho THCS
      const gradeMultiplier = (grade.level - 5) * 50000; // Tăng 50k mỗi khối
      const amount = baseFee + gradeMultiplier;
      
      const feeStructure = await prisma.feeStructure.create({
      data: {
          name: `Học phí ${subject.name} ${grade.name}`,
          amount: amount,
          period: 'monthly',
          description: `Học phí tháng cho môn ${subject.name} khối ${grade.name}`,
          isActive: true,
          gradeId: grade.id,
          subjectId: subject.id
        }
      });
      
      feeStructures.push(feeStructure);
    }
  }

  return feeStructures;
}

async function createClasses(subjects, rooms, grades, teachers, feeStructures) {
  console.log('📖 Tạo lớp học...');
  
  const classes = [];
  const scheduleTypes = Object.keys(STANDARD_SCHEDULES);
  let classIndex = 0;

  for (const subject of subjects) {
    for (let i = 0; i < CONFIG.NUM_CLASSES_PER_SUBJECT; i++) {
      const grade = grades[i % grades.length];
      const room = rooms[classIndex % rooms.length];
      const teacher = teachers.find(t => t.subjects.includes(subject.name)) || teachers[classIndex % teachers.length];
      const scheduleType = scheduleTypes[classIndex % scheduleTypes.length];
      
      const feeStructure = feeStructures.find(fs => 
        fs.gradeId === grade.id && fs.subjectId === subject.id
      );

      // Tạo status đa dạng: 80% ACTIVE, 10% READY, 5% DRAFT, 5% COMPLETED
      let classStatus;
      const rand = Math.random();
      if (rand < 0.80) {
        classStatus = CLASS_STATUS.ACTIVE; // 80% lớp đang hoạt động
      } else if (rand < 0.90) {
        classStatus = CLASS_STATUS.READY; // 10% lớp sẵn sàng (đang tuyển sinh)
      } else if (rand < 0.95) {
        classStatus = CLASS_STATUS.DRAFT; // 5% lớp nháp
      } else {
        classStatus = CLASS_STATUS.COMPLETED; // 5% lớp đã hoàn thành
      }

      const classData = {
        name: `${subject.name} ${grade.name}${String.fromCharCode(65 + i)}`,
        classCode: `CLS${String(classIndex + 1).padStart(4, '0')}`,
        subjectId: subject.id,
        roomId: room.id,
        gradeId: grade.id,
        teacherId: teacher.id,
        feeStructureId: feeStructure?.id,
        maxStudents: 25,
        status: classStatus,
        description: `Lớp ${subject.name} dành cho học sinh ${grade.name}`,
        academicYear: CURRENT_ACADEMIC_YEAR,
        expectedStartDate: ACADEMIC_YEAR_START,
        actualStartDate: classStatus === CLASS_STATUS.ACTIVE || classStatus === CLASS_STATUS.COMPLETED ? ACADEMIC_YEAR_START : null,
        actualEndDate: classStatus === CLASS_STATUS.COMPLETED ? new Date('2025-05-30') : null,
        feeAmount: feeStructure?.amount || 800000,
        feePeriod: 'monthly',
        feeCurrency: 'VND',
        feeLockedAt: classStatus !== CLASS_STATUS.DRAFT ? ACADEMIC_YEAR_START : null,
        recurringSchedule: {
          schedules: STANDARD_SCHEDULES[scheduleType]
        }
      };

      const newClass = await prisma.class.create({ data: classData });
      classes.push(newClass);
      classIndex++;
    }
  }

  return classes;
}

async function createEnrollments(students, classes) {
  console.log('📝 Tạo đăng ký lớp học...');
  
  // Mỗi học sinh đăng ký 2-4 lớp
  for (const student of students) {
    const numClasses = 2 + (students.indexOf(student) % 3);
    const selectedClasses = [];
    
    // Chọn lớp phù hợp với khối của học sinh và đang ACTIVE hoặc READY
    const studentGrade = student.grade;
    const suitableClasses = classes.filter(c => {
      const classGrade = c.name.match(/Lớp (\d+)/);
      return classGrade && classGrade[1] === studentGrade && 
             (c.status === CLASS_STATUS.ACTIVE || c.status === CLASS_STATUS.READY);
    });
    
    for (let i = 0; i < Math.min(numClasses, suitableClasses.length); i++) {
      if (i < suitableClasses.length) {
        selectedClasses.push(suitableClasses[i]);
      }
    }

    for (const classItem of selectedClasses) {
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          classId: classItem.id,
          status: ENROLLMENT_STATUS.STUDYING, // Đang học
          semester: '2024-1',
          enrolledAt: ACADEMIC_YEAR_START
        }
      });
    }
  }
}

async function createClassSessions(classes) {
  console.log('📅 Tạo buổi học...');
  
  const today = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  for (const classItem of classes) {
    // Chỉ tạo sessions cho lớp ACTIVE hoặc COMPLETED
    if (classItem.status !== CLASS_STATUS.ACTIVE && classItem.status !== CLASS_STATUS.COMPLETED) {
      continue;
    }
    
    if (!classItem.recurringSchedule?.schedules) continue;
    
    const schedules = classItem.recurringSchedule.schedules;
    
    // Tạo sessions từ ngày bắt đầu đến hiện tại
    let currentDate = new Date(ACADEMIC_YEAR_START);
    
    while (currentDate <= today && currentDate <= ACADEMIC_YEAR_END) {
      const dayName = dayNames[currentDate.getDay()];
      
      // Check if this day has a scheduled session
      const daySchedule = schedules.find(s => s.day === dayName);
      
      if (daySchedule) {
        // Xác định status dựa trên ngày
        let sessionStatus;
        if (currentDate < today) {
          sessionStatus = SESSION_STATUS.END; // Buổi đã kết thúc
        } else if (currentDate.toDateString() === today.toDateString()) {
          sessionStatus = SESSION_STATUS.HAPPENING; // Buổi đang diễn ra (hôm nay)
        } else {
          sessionStatus = SESSION_STATUS.HAS_NOT_HAPPENED; // Buổi chưa diễn ra
        }

        await prisma.classSession.create({
          data: {
            classId: classItem.id,
            teacherId: classItem.teacherId,
            academicYear: CURRENT_ACADEMIC_YEAR,
            sessionDate: new Date(currentDate),
            startTime: daySchedule.startTime,
            endTime: daySchedule.endTime,
            roomId: classItem.roomId,
            status: sessionStatus,
            notes: null
          }
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
}

async function createFeeRecords(students, classes) {
  console.log('💵 Tạo hóa đơn học phí...');
  
  const enrollments = await prisma.enrollment.findMany({
    include: {
      class: { include: { feeStructure: true } },
      student: true
    }
  });

  for (const enrollment of enrollments) {
    if (!enrollment.class.feeStructureId) continue;
    
    const feeStructure = enrollment.class.feeStructure;
    const amount = parseFloat(feeStructure.amount);
    
    // Tạo hóa đơn cho các tháng từ tháng 9 đến hiện tại
    const monthsPassed = Math.floor((new Date() - ACADEMIC_YEAR_START) / (30 * 24 * 60 * 60 * 1000)) + 1;
    
    for (let month = 0; month < Math.min(monthsPassed, 3); month++) {
      const dueDate = new Date(ACADEMIC_YEAR_START);
      dueDate.setMonth(dueDate.getMonth() + month + 1);
      dueDate.setDate(5); // Hạn nộp ngày 5 hàng tháng
      
      const isPaid = month < monthsPassed - 1; // Các tháng trước đã thanh toán
      const paidAmount = isPaid ? amount : 0;

      await prisma.feeRecord.create({
        data: {
          studentId: enrollment.studentId,
          feeStructureId: enrollment.class.feeStructureId,
          classId: enrollment.classId,
          amount: amount,
          dueDate: dueDate,
          paidAmount: paidAmount,
          status: isPaid ? FEE_STATUS.PAID : FEE_STATUS.PENDING,
          discount: 0,
          totalAmount: amount,
          notes: `Học phí tháng ${9 + month}/2024`
        }
      });
  }
}
}

async function createPayments(parents, students) {
  console.log('💳 Tạo thanh toán...');
  
  const paidFeeRecords = await prisma.feeRecord.findMany({
    where: { status: FEE_STATUS.PAID },
    include: { student: true }
  });

  for (const feeRecord of paidFeeRecords) {
    const student = feeRecord.student;
    if (!student.parentId) continue;
    
    const payment = await prisma.payment.create({
      data: {
        parentId: student.parentId,
        amount: feeRecord.paidAmount,
        method: 'bank_transfer',
        status: 'completed',
        reference: `REF${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        transactionCode: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        paidAt: new Date(feeRecord.dueDate.getTime() - 5 * 24 * 60 * 60 * 1000), // Trả trước hạn 5 ngày
        notes: `Thanh toán học phí`
      }
    });

    await prisma.feeRecordPayment.create({
      data: {
        feeRecordId: feeRecord.id,
        paymentId: payment.id
      }
    });
  }
}

async function createAssessments(classes) {
  console.log('📝 Tạo bài kiểm tra...');
  
  const assessmentTypes = [
    { name: 'Kiểm tra 15 phút', type: 'quiz', maxScore: 10 },
    { name: 'Kiểm tra 1 tiết', type: 'exam', maxScore: 10 },
    { name: 'Thi giữa kỳ', type: 'exam', maxScore: 10 }
  ];

  for (const classItem of classes) {
    for (const assessmentType of assessmentTypes) {
      const assessmentDate = new Date(ACADEMIC_YEAR_START);
      assessmentDate.setMonth(assessmentDate.getMonth() + assessmentTypes.indexOf(assessmentType) + 1);
    
    await prisma.assessment.create({
      data: {
        classId: classItem.id,
          name: assessmentType.name,
          type: assessmentType.type,
          maxScore: assessmentType.maxScore,
          date: assessmentDate,
          description: `${assessmentType.name} cho lớp ${classItem.name}`
        }
      });
    }
  }
}

async function createMaterials(classes, teachers) {
  console.log('📚 Tạo tài liệu học tập...');
  
  const materialTypes = [
    { title: 'Bài giảng tuần 1', category: 'Lecture', fileType: 'pdf' },
    { title: 'Bài tập thực hành', category: 'Exercise', fileType: 'pdf' },
    { title: 'Tài liệu tham khảo', category: 'Reference', fileType: 'pdf' }
  ];

  for (const classItem of classes) {
    const teacher = teachers.find(t => t.id === classItem.teacherId);
    if (!teacher) continue;

    for (const materialType of materialTypes) {
    await prisma.material.create({
      data: {
        classId: classItem.id,
          title: `${materialType.title} - ${classItem.name}`,
          fileName: `${materialType.title.toLowerCase().replace(/\s+/g, '_')}.${materialType.fileType}`,
          category: materialType.category,
        uploadedBy: teacher.id,
          description: `${materialType.title} cho lớp ${classItem.name}`,
          fileSize: 1024 * 1024 * 2, // 2MB
          fileType: materialType.fileType,
          fileUrl: `https://storage.example.com/materials/${classItem.classCode}/${materialType.title}`,
          downloads: 0
        }
      });
    }
  }
}

async function createStudentAttendances(classes, students) {
  console.log('✅ Tạo điểm danh...');
  
  const sessions = await prisma.classSession.findMany({
    where: { status: SESSION_STATUS.END }, // Chỉ lấy buổi đã kết thúc
    include: {
      class: {
        include: {
          enrollments: { include: { student: true } }
        }
      }
    }
  });

  for (const session of sessions) {
    const enrolledStudents = session.class.enrollments.map(e => e.student);
    
    for (const student of enrolledStudents) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: session.teacherId }
      });
      
      if (!teacher) continue;

      // 90% có mặt, 5% vắng, 5% đi muộn
      const rand = Math.random();
      let attendanceStatus;
      if (rand > 0.95) {
        attendanceStatus = ATTENDANCE_STATUS.ABSENT;
      } else if (rand > 0.90) {
        attendanceStatus = ATTENDANCE_STATUS.LATE;
      } else {
        attendanceStatus = ATTENDANCE_STATUS.PRESENT;
      }
      
      await prisma.studentSessionAttendance.create({
        data: {
          sessionId: session.id,
          studentId: student.id,
          status: attendanceStatus,
          recordedBy: teacher.id,
          recordedAt: session.sessionDate,
          isSent: true,
          sentAt: session.sessionDate
        }
      });
    }
  }
}

async function createStudentGrades(classes, students) {
  console.log('📊 Tạo điểm số...');
  
  const assessments = await prisma.assessment.findMany({
    include: {
      class: {
        include: {
          enrollments: { include: { student: true } },
          teacher: true
        }
      }
    }
  });

  for (const assessment of assessments) {
    const enrolledStudents = assessment.class.enrollments.map(e => e.student);
    
    for (const student of enrolledStudents) {
      if (!assessment.class.teacher) continue;
      
      const teacherUser = await prisma.user.findUnique({
        where: { id: assessment.class.teacher.userId }
      });
      
      if (!teacherUser) continue;

      // Random điểm từ 6-10
      const score = 6 + Math.random() * 4;
      
      await prisma.studentAssessmentGrade.create({
      data: {
          assessmentId: assessment.id,
          studentId: student.id,
          score: parseFloat(score.toFixed(1)),
          gradedBy: teacherUser.id,
          gradedAt: new Date(assessment.date.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 ngày sau khi thi
          feedback: score >= 8 ? 'Tốt' : score >= 6.5 ? 'Khá' : 'Cần cố gắng'
        }
      });
    }
  }
}

async function createNotifications(adminUser) {
  console.log('🔔 Tạo thông báo...');
  
  const notifications = [
    {
      title: 'Thông báo khai giảng năm học 2024-2025',
      body: 'Trung tâm thông báo khai giảng năm học mới từ ngày 01/09/2024. Các em học sinh vui lòng chuẩn bị đầy đủ sách vở và đồng phục.',
      audience: { roles: ['student', 'parent', 'teacher'], schools: [] },
      priority: 'high',
      type: 'academic',
      sentAt: ACADEMIC_YEAR_START,
      scheduledFor: ACADEMIC_YEAR_START
    },
    {
      title: 'Thông báo lịch thi giữa kỳ',
      body: 'Lịch thi giữa kỳ sẽ diễn ra từ ngày 15/10/2024 đến 25/10/2024. Học sinh cần ôn tập kỹ lưỡng.',
      audience: { roles: ['student', 'parent'], schools: [] },
      priority: 'normal',
      type: 'academic',
      sentAt: new Date('2024-10-01'),
      scheduledFor: new Date('2024-10-01')
    },
    {
      title: 'Nhắc nhở nộp học phí',
      body: 'Phụ huynh vui lòng nộp học phí tháng trước ngày 5 hàng tháng để tránh bị gián đoạn việc học của các em.',
      audience: { roles: ['parent'], schools: [] },
      priority: 'normal',
      type: 'financial',
      sentAt: new Date('2024-09-25'),
      scheduledFor: new Date('2024-09-25')
    }
  ];

  for (const notif of notifications) {
    await prisma.notification.create({
      data: {
        ...notif,
        createdBy: adminUser.id
      }
    });
  }
}

async function createLeaveRequests(teachers, students) {
  console.log('🏖️ Tạo đơn xin nghỉ...');
  
  // Teacher leave request
  const teacher = teachers[0];
  const teacherUser = await prisma.user.findUnique({
    where: { id: teacher.userId }
  });

  await prisma.leaveRequest.create({
    data: {
      requestType: 'sick_leave',
      teacherId: teacher.id,
      startDate: new Date('2024-10-15'),
      endDate: new Date('2024-10-16'),
      reason: 'Ốm, cần nghỉ dưỡng bệnh',
      status: LEAVE_REQUEST_STATUS.APPROVED,
      createdBy: teacherUser.id,
      approvedBy: teacherUser.id, // Admin would approve
      approvedAt: new Date('2024-10-14'),
      notes: 'Đã tìm giáo viên thay thế'
    }
  });

  // Student leave request
  const student = students[0];
  const studentUser = await prisma.user.findUnique({
    where: { id: student.userId }
  });

  await prisma.leaveRequest.create({
    data: {
      requestType: 'personal_leave',
      studentId: student.id,
      startDate: new Date('2024-10-20'),
      endDate: new Date('2024-10-20'),
      reason: 'Có việc gia đình',
      status: LEAVE_REQUEST_STATUS.PENDING,
      createdBy: studentUser.id,
      notes: null
    }
  });
}

async function createStudentClassRequests(students, classes) {
  console.log('📨 Tạo yêu cầu tham gia lớp...');
  
  // Lấy các lớp ACTIVE hoặc READY để request
  const availableClasses = classes.filter(c => 
    c.status === CLASS_STATUS.ACTIVE || c.status === CLASS_STATUS.READY
  );
  
  // Một vài học sinh đăng ký thêm lớp
  for (let i = 0; i < Math.min(5, students.length - 10, availableClasses.length); i++) {
    const student = students[i + 10]; // Học sinh chưa đăng ký nhiều lớp
    const classItem = availableClasses[i];
    
    // Kiểm tra xem student đã đăng ký lớp này chưa
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: student.id,
        classId: classItem.id
      }
    });
    
    // Chỉ tạo request nếu chưa đăng ký
    if (!existingEnrollment) {
      await prisma.studentClassRequest.create({
        data: {
          studentId: student.id,
          classId: classItem.id,
          message: `Em muốn đăng ký học thêm lớp ${classItem.name}. Em cam kết sẽ học tập nghiêm túc và hoàn thành tốt chương trình.`,
          status: i < 3 ? CLASS_REQUEST_STATUS.APPROVED : CLASS_REQUEST_STATUS.PENDING,
          processedAt: i < 3 ? new Date() : null
        }
      });
    }
  }
}

async function printSummary() {
  console.log('\n📊 Tổng kết dữ liệu:');

  const counts = await Promise.all([
    prisma.school.count(),
    prisma.teacher.count(),
    prisma.student.count(),
    prisma.parent.count(),
    prisma.grade.count(),
    prisma.subject.count(),
    prisma.class.count(),
    prisma.classSession.count(),
    prisma.enrollment.count(),
    prisma.feeRecord.count(),
    prisma.payment.count(),
    prisma.assessment.count(),
    prisma.material.count(),
    prisma.studentSessionAttendance.count(),
    prisma.studentAssessmentGrade.count(),
    prisma.notification.count(),
    prisma.leaveRequest.count(),
    prisma.studentClassRequest.count(),
    prisma.academicYear.count()
  ]);

  console.log(`🏫 Trường học: ${counts[0]}`);
  console.log(`👨‍🏫 Giáo viên: ${counts[1]}`);
  console.log(`👨‍🎓 Học sinh: ${counts[2]}`);
  console.log(`👨‍👩‍👧‍👦 Phụ huynh: ${counts[3]}`);
  console.log(`📚 Khối lớp: ${counts[4]}`);
  console.log(`📖 Môn học: ${counts[5]}`);
  console.log(`📝 Lớp học: ${counts[6]}`);
  console.log(`📅 Buổi học: ${counts[7]}`);
  console.log(`📋 Đăng ký: ${counts[8]}`);
  console.log(`💰 Hóa đơn: ${counts[9]}`);
  console.log(`💳 Thanh toán: ${counts[10]}`);
  console.log(`📝 Bài kiểm tra: ${counts[11]}`);
  console.log(`📚 Tài liệu: ${counts[12]}`);
  console.log(`✅ Điểm danh: ${counts[13]}`);
  console.log(`📊 Điểm số: ${counts[14]}`);
  console.log(`🔔 Thông báo: ${counts[15]}`);
  console.log(`🏖️ Đơn xin nghỉ: ${counts[16]}`);
  console.log(`📨 Yêu cầu tham gia lớp: ${counts[17]}`);
  console.log(`📅 Năm học: ${counts[18]}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed thất bại:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
