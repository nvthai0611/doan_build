# NGHIỆP VỤ PHỤ HUYNH ĐĂNG KÝ KHÓA HỌC CHO CON

## TỔNG QUAN NGHIỆP VỤ

Phụ huynh đăng ký khóa học cho con bao gồm các bước:
1. **Tạo tài khoản phụ huynh** (nếu chưa có)
2. **Thêm thông tin con** (tạo User + Student)
3. **Upload hợp đồng**
4. **Gán học sinh vào lớp** (tự động hoặc thủ công)
5. **Xử lý phê duyệt đăng ký**
6. **Tạo tài khoản cho học sinh** (sau khi đăng ký thành công)
7. **Gửi email thông báo**

## KIẾN TRÚC TÀI KHOẢN

- **Parent Account**: Tài khoản phụ huynh để quản lý con cái
- **Student Account**: Tài khoản học sinh để học tập và xem điểm
- **Mỗi role có màn hình riêng**: Parent dashboard và Student dashboard

---

## STEP 1: TẠO TÀI KHOẢN PHỤ HUYNH (NẾU CHƯA CÓ)

### 1.1 Kiểm tra tài khoản phụ huynh

**Prisma Query:**
```typescript
// Kiểm tra parent đã tồn tại chưa
const existingParent = await prisma.user.findFirst({
  where: {
    OR: [
      { email: parentEmail },
      { phone: parentPhone }
    ]
  },
  include: {
    parent: true
  }
});
```

### 1.2 Tạo tài khoản phụ huynh mới

**Prisma Query:**
```typescript
if (!existingParent) {
  // Tạo user parent
  const parentUser = await prisma.user.create({
    data: {
      email: parentEmail,
      phone: parentPhone,
      fullName: parentFullName,
      username: parentEmail,
      password: await hashPassword(parentPassword), // parent tự đặt password
      role: 'parent',
      isActive: true
    }
  });

  // Tạo parent record
  const parent = await prisma.parent.create({
    data: {
      userId: parentUser.id
    }
  });

  // Gửi email xác nhận tài khoản
  await sendEmail({
    to: parentEmail,
    subject: 'Chào mừng bạn đến với hệ thống',
    template: 'parent-welcome',
    data: {
      parentName: parentFullName,
      loginUrl: `${process.env.FRONTEND_URL}/auth/login`
    }
  });
}
```

---

## STEP 2: THÊM THÔNG TIN CON (TẠO USER + STUDENT)

### 2.1 Form thêm thông tin con

**Input Form:**
```typescript
interface AddChildForm {
  childFullName: string;
  childEmail: string;
  childPhone: string;
  childBirthDate: string;
  childGender: 'MALE' | 'FEMALE' | 'OTHER';
  childAddress: string;
  childGrade: string;
  schoolId: string;
  parentId: string; // từ session hiện tại
}
```

### 2.2 Kiểm tra thông tin con đã tồn tại

**Prisma Query:**
```typescript
// Kiểm tra child đã tồn tại chưa
const existingChild = await prisma.user.findFirst({
  where: {
    OR: [
      { email: childEmail },
      { phone: childPhone }
    ]
  },
  include: {
    student: true
  }
});

if (existingChild) {
  throw new Error('Thông tin con đã tồn tại trong hệ thống');
}
```

### 2.3 Tạo User cho con (chưa active)

**Prisma Query:**
```typescript
// Tạo user cho con (chưa active, chưa có password)
const childUser = await prisma.user.create({
  data: {
    email: childEmail,
    phone: childPhone,
    fullName: childFullName,
    username: childEmail,
    password: '', // chưa set password
    role: 'student',
    gender: childGender,
    birthDate: new Date(childBirthDate),
    isActive: false // chưa active, chờ đăng ký thành công
  }
});

// Tạo student record
const student = await prisma.student.create({
  data: {
    userId: childUser.id,
    schoolId: schoolId,
    grade: childGrade,
    address: childAddress,
    studentCode: generateStudentCode(),
    parentId: parentId // liên kết với parent
  }
});

// Gửi email thông báo cho phụ huynh
await sendEmail({
  to: parentEmail,
  subject: 'Thông tin con đã được thêm thành công',
  template: 'child-added',
  data: {
    parentName: parentFullName,
    childName: childFullName,
    nextStep: 'Vui lòng upload hợp đồng để tiếp tục đăng ký khóa học'
  }
});
```

---

## STEP 3: UPLOAD HỢP ĐỒNG

### 2.1 Tạo Contract Template

**Prisma Query:**
```typescript
// Tạo template hợp đồng (nếu chưa có)
const contractTemplate = await prisma.contractTemplate.create({
  data: {
    name: 'Hợp đồng học tập',
    type: 'student_enrollment',
    description: 'Template hợp đồng đăng ký khóa học',
    templateUrl: '/templates/student-contract.pdf',
    version: '1.0',
    isActive: true
  }
});
```

### 2.2 Upload Contract cho Student

**Prisma Query:**
```typescript
// Upload hợp đồng sau khi student đã được tạo
const contractUpload = await prisma.contractUpload.create({
  data: {
    studentId: studentId, // từ enrollment
    templateId: contractTemplate.id,
    contractType: 'student_enrollment',
    uploadedImageUrl: uploadedImageUrl, // từ file upload
    uploadedImageName: fileName,
    isSigned: true,
    status: 'pending', // chờ phê duyệt
    contractStartDate: new Date(),
    contractEndDate: calculateEndDate(), // tính toán ngày kết thúc
    notes: 'Hợp đồng đăng ký khóa học'
  }
});
```

### 2.3 Xử lý phê duyệt hợp đồng

**Prisma Query:**
```typescript
// Center owner phê duyệt hợp đồng
const approvedContract = await prisma.contractUpload.update({
  where: { id: contractId },
  data: {
    status: 'approved',
    reviewedAt: new Date(),
    reviewedBy: reviewerId, // center owner
    reviewNotes: 'Hợp đồng đã được phê duyệt'
  }
});
```

---

## STEP 3: GÁN HỌC SINH VÀO LỚP (ENROLLMENT)

### 3.1 Kiểm tra điều kiện đăng ký lớp

**Prisma Query:**
```typescript
// 1. Kiểm tra lớp chưa full
const enrollmentCount = await prisma.enrollment.count({
  where: {
    classId: classId,
    status: 'active'
  }
});

const classInfo = await prisma.class.findUnique({
  where: { id: classId },
  include: {
    teacherClassAssignments: {
      where: {
        status: 'active',
        academicYear: currentAcademicYear
      }
    }
  }
});

// Kiểm tra số lượng học sinh tối đa
if (enrollmentCount >= classInfo.maxStudents) {
  throw new Error('Lớp đã đầy');
}

// 2. Kiểm tra học sinh chưa đăng ký lớp này
const existingEnrollment = await prisma.enrollment.findFirst({
  where: {
    studentId: studentId,
    classId: classId,
    status: 'active'
  }
});

if (existingEnrollment) {
  throw new Error('Học sinh đã đăng ký lớp này');
}
```

### 3.2 Tạo StudentClassRequest (Yêu cầu đăng ký)

**Prisma Query:**
```typescript
// Tạo yêu cầu đăng ký lớp
const classRequest = await prisma.studentClassRequest.create({
  data: {
    studentId: studentId,
    classId: classId,
    message: 'Phụ huynh đăng ký khóa học cho con',
    status: 'pending' // chờ phê duyệt
  }
});
```

### 3.3 Tự động hoặc thủ công tạo Enrollment

#### 3.3.1 Tự động tạo Enrollment (nếu có slot trống)

**Prisma Query:**
```typescript
// Tự động tạo enrollment
const enrollment = await prisma.enrollment.create({
  data: {
    studentId: studentId,
    classId: classId,
    status: 'active',
    semester: currentSemester,
    enrolledAt: new Date(),
    teacherClassAssignmentId: classInfo.teacherClassAssignments[0]?.id
  }
});

// Cập nhật trạng thái request
await prisma.studentClassRequest.update({
  where: { id: classRequest.id },
  data: {
    status: 'approved',
    processedAt: new Date()
  }
});
```

#### 3.3.2 Thủ công phê duyệt bởi Center Owner

**Prisma Query:**
```typescript
// Center owner phê duyệt request
const approvedRequest = await prisma.studentClassRequest.update({
  where: { id: requestId },
  data: {
    status: 'approved',
    processedAt: new Date()
  }
});

// Sau đó tạo enrollment
const enrollment = await prisma.enrollment.create({
  data: {
    studentId: approvedRequest.studentId,
    classId: approvedRequest.classId,
    status: 'active',
    semester: currentSemester,
    enrolledAt: new Date(),
    teacherClassAssignmentId: getTeacherAssignmentId(approvedRequest.classId)
  }
});
```

---

## STEP 5: XỬ LÝ PHÊ DUYỆT ĐĂNG KÝ

### 5.1 Center Owner phê duyệt đăng ký

**Prisma Query:**
```typescript
// Phê duyệt enrollment
const approvedEnrollment = await prisma.enrollment.update({
  where: { id: enrollmentId },
  data: {
    status: 'active',
    enrolledAt: new Date()
  }
});

// Cập nhật trạng thái request
await prisma.studentClassRequest.update({
  where: { id: classRequestId },
  data: {
    status: 'approved',
    processedAt: new Date()
  }
});

// Cập nhật trạng thái contract
await prisma.contractUpload.update({
  where: { id: contractId },
  data: {
    status: 'approved',
    reviewedAt: new Date(),
    reviewedBy: reviewerId
  }
});
```

### 5.2 Tạo tài khoản cho học sinh (sau khi đăng ký thành công)

**Prisma Query:**
```typescript
// Tạo password cho học sinh
const studentPassword = generateRandomPassword();
const hashedPassword = await hashPassword(studentPassword);

// Cập nhật user của học sinh
const activatedStudent = await prisma.user.update({
  where: { id: studentUserId },
  data: {
    password: hashedPassword,
    isActive: true
  }
});

// Gửi email thông báo cho học sinh
await sendEmail({
  to: studentEmail,
  subject: 'Tài khoản học tập của bạn đã được kích hoạt',
  template: 'student-account-activated',
  data: {
    studentName: studentFullName,
    username: studentEmail,
    password: studentPassword, // gửi password tạm thời
    loginUrl: `${process.env.FRONTEND_URL}/auth/login`,
    dashboardUrl: `${process.env.FRONTEND_URL}/student/dashboard`
  }
});

// Gửi email thông báo cho phụ huynh
await sendEmail({
  to: parentEmail,
  subject: 'Con bạn đã được đăng ký thành công',
  template: 'enrollment-success',
  data: {
    parentName: parentFullName,
    childName: studentFullName,
    className: classInfo.name,
    studentUsername: studentEmail,
    studentPassword: studentPassword,
    loginUrl: `${process.env.FRONTEND_URL}/auth/login`
  }
});
```

---

## STEP 6: TẠO NOTIFICATION VÀ AUDIT LOG

### 6.1 Tạo thông báo

**Prisma Query:**
```typescript
// Tạo notification cho phụ huynh
const parentNotification = await prisma.notification.create({
  data: {
    title: 'Đăng ký khóa học thành công',
    body: `Con bạn ${studentFullName} đã được đăng ký vào lớp ${classInfo.name}`,
    audience: {
      type: 'parent',
      parentId: parentId
    },
    type: 'enrollment_confirmation',
    priority: 'normal',
    createdBy: systemUserId
  }
});

// Tạo notification cho học sinh
const studentNotification = await prisma.notification.create({
  data: {
    title: 'Chào mừng bạn đến với lớp học',
    body: `Bạn đã được đăng ký vào lớp ${classInfo.name}`,
    audience: {
      type: 'student',
      studentId: studentId
    },
    type: 'welcome_message',
    priority: 'normal',
    createdBy: systemUserId
  }
});
```

### 6.2 Tạo Audit Log

**Prisma Query:**
```typescript
// Tạo audit log cho enrollment
const enrollmentAuditLog = await prisma.auditLog.create({
  data: {
    userId: parentUserId,
    action: 'student_enrollment',
    tableName: 'enrollments',
    recordId: enrollment.id,
    newValues: {
      studentId: studentId,
      classId: classId,
      status: 'active',
      enrolledAt: new Date()
    },
    ipAddress: requestIp,
    userAgent: requestUserAgent
  }
});

// Tạo audit log cho account activation
const accountAuditLog = await prisma.auditLog.create({
  data: {
    userId: studentUserId,
    action: 'account_activated',
    tableName: 'users',
    recordId: studentUserId,
    newValues: {
      isActive: true,
      password: '***' // không lưu password thật
    },
    ipAddress: requestIp,
    userAgent: requestUserAgent
  }
});
```

---

## FLOW TỔNG QUAN

### Flow đăng ký hoàn chỉnh:
1. **Parent** → Tạo tài khoản → Thêm thông tin con → Upload Contract → Tạo Request
2. **Center Owner** → Review Contract → Approve Request → Create Enrollment → Activate Student Account
3. **System** → Send Email Notifications → Create Audit Logs

### Flow tự động (nếu có slot trống):
1. **Parent** → Đăng ký online → Upload Contract → Auto Enrollment → Activate Account
2. **System** → Send Email Notifications → Create Audit Logs

---

## CÁC BẢNG CHÍNH SỬ DỤNG

1. **User** - Thông tin người dùng (Parent + Student)
2. **Student** - Thông tin học sinh  
3. **Parent** - Thông tin phụ huynh
4. **Class** - Thông tin lớp học
5. **Enrollment** - Đăng ký học sinh vào lớp
6. **StudentClassRequest** - Yêu cầu đăng ký lớp
7. **ContractUpload** - Upload hợp đồng
8. **ContractTemplate** - Template hợp đồng
9. **Notification** - Thông báo
10. **AuditLog** - Log hoạt động

---

## VALIDATION RULES

1. **Email/Phone** phải unique trong hệ thống
2. **Student** chỉ có thể đăng ký 1 lớp cùng lúc (trong cùng semester)
3. **Class** không được vượt quá maxStudents
4. **Contract** phải được phê duyệt trước khi enrollment
5. **Student Account** chỉ được kích hoạt sau khi enrollment thành công

---

## ERROR HANDLING

1. **Duplicate User**: Thông báo user đã tồn tại, hỏi có muốn tạo student không
2. **Class Full**: Thông báo lớp đã đầy, đề xuất lớp khác
3. **Contract Rejected**: Thông báo hợp đồng bị từ chối, yêu cầu upload lại
4. **Enrollment Failed**: Thông báo đăng ký thất bại, cho phép thử lại

---

## EMAIL TEMPLATES CẦN THIẾT

### 1. Parent Welcome Email
```html
Chào mừng {{parentName}} đến với hệ thống!
Tài khoản của bạn đã được tạo thành công.
Đăng nhập tại: {{loginUrl}}
```

### 2. Child Added Email
```html
Thông tin con {{childName}} đã được thêm thành công.
Bước tiếp theo: Upload hợp đồng để tiếp tục đăng ký khóa học.
```

### 3. Student Account Activated Email
```html
Tài khoản học tập của {{studentName}} đã được kích hoạt!
Username: {{username}}
Password: {{password}}
Đăng nhập tại: {{loginUrl}}
Dashboard: {{dashboardUrl}}
```

### 4. Enrollment Success Email (Parent)
```html
Con bạn {{childName}} đã được đăng ký thành công vào lớp {{className}}!
Thông tin đăng nhập của con:
Username: {{studentUsername}}
Password: {{studentPassword}}
Đăng nhập tại: {{loginUrl}}
```

---

## DASHBOARD SCREENS

### Parent Dashboard
- Danh sách con cái
- Thông tin lớp học của con
- Upload hợp đồng
- Xem điểm số của con
- Thông báo

### Student Dashboard  
- Thông tin lớp học
- Lịch học
- Điểm số
- Tài liệu học tập
- Thông báo
