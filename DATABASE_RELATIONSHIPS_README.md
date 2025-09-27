# 🗄️ Database Relationships & Design Rationale
## Hệ thống quản lý trung tâm dạy học - Mỗi lớp chỉ dạy 1 môn

---

## 📋 **TỔNG QUAN HỆ THỐNG**

### **🎯 Mục tiêu:**
Quản lý trung tâm dạy học với nhiều môn (Toán, Văn, Anh, Lý, Hóa, Sinh) nhưng mỗi lớp chỉ dạy 1 môn cụ thể.

### **👥 Đối tượng sử dụng:**
- **Admin**: Quản lý toàn bộ hệ thống
- **Giáo viên**: Dạy học, chấm điểm, quản lý lớp
- **Học sinh**: Đăng ký, học tập, xem kết quả
- **Phụ huynh**: Theo dõi tiến độ con em

---

## 🏗️ **KIẾN TRÚC DATABASE THEO TẦNG**

### **📊 Sơ đồ tổng quan:**
```
🏢 TIER 1: CORE MANAGEMENT (Quản lý cốt lõi)
├── Center (Trung tâm)
├── User (Người dùng)
├── Teacher (Giáo viên)
├── Student (Học sinh)
└── Parent (Phụ huynh)

📚 TIER 2: ACADEMIC STRUCTURE (Cấu trúc học tập)
├── Subject (Môn học)
├── Grade (Khối lớp)
├── Class (Lớp học)
├── Room (Phòng học)
├── Curriculum (Chương trình)
└── Lesson (Bài học)

📋 TIER 3: STUDENT MANAGEMENT (Quản lý học sinh)
├── Enrollment (Đăng ký học)
├── Attendance (Điểm danh)
├── Assessment (Kiểm tra)
├── Grade (Điểm số)
├── Homework (Bài tập)
└── Progress (Tiến độ)

💰 TIER 4: FINANCIAL MANAGEMENT (Quản lý tài chính)
├── FeeStructure (Cấu trúc học phí)
├── FeeRecord (Học phí học sinh)
├── Payment (Thanh toán)
└── Discount (Giảm giá)

🔔 TIER 5: SUPPORT SYSTEMS (Hệ thống hỗ trợ)
├── Notification (Thông báo)
├── Message (Tin nhắn)
├── AuditLog (Nhật ký)
└── Feedback (Phản hồi)
```

---

## 🔗 **CHI TIẾT MỐI QUAN HỆ CÁC BẢNG**

### **🏢 TIER 1: CORE MANAGEMENT**

#### **1. Center (Trung tâm) - Bảng gốc**
```prisma
model Center {
  id        String   @id @default(uuid()) @db.Uuid
  name      String   // "Trung tâm ABC"
  address   String?
  phone     String?
  email     String?
  settings  Json?    // Cấu hình trung tâm
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Relations - 1 Center có nhiều...
  teachers  Teacher[]
  students  Student[]
  rooms     Room[]
  classes   Class[]
}
```

**🎯 Tại sao cần bảng Center:**
- **Quản lý đa trung tâm**: Có thể mở rộng nhiều chi nhánh
- **Cấu hình riêng**: Mỗi trung tâm có quy định khác nhau
- **Báo cáo**: Thống kê theo từng trung tâm
- **Phân quyền**: Giáo viên/học sinh thuộc trung tâm nào

#### **2. User (Người dùng) - Bảng trung tâm**
```prisma
model User {
  id        String   @id @default(uuid()) @db.Uuid
  email     String   @unique
  username  String   @unique
  password  String
  fullName  String?  @map("full_name")
  phone     String?
  role      String   // admin, teacher, student, parent
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Relations - 1 User có thể là...
  teacher   Teacher?  // 1 hoặc 0
  student   Student?  // 1 hoặc 0
  parent    Parent?   // 1 hoặc 0
}
```

**🎯 Tại sao cần bảng User:**
- **Single Sign-On**: 1 tài khoản cho tất cả vai trò
- **Bảo mật**: Quản lý đăng nhập tập trung
- **Phân quyền**: Role-based access control
- **Audit**: Theo dõi hoạt động người dùng

#### **3. Teacher (Giáo viên) - Kế thừa từ User**
```prisma
model Teacher {
  id            String            @id @default(uuid()) @db.Uuid
  userId        String            @unique @map("user_id") @db.Uuid
  subjects      String[]          // ["MATH", "LITERATURE", "ENGLISH"]
  experience    Int?              // Số năm kinh nghiệm
  qualifications String?          // Bằng cấp, chứng chỉ
  bio           String?           // Giới thiệu
  isActive      Boolean           @default(true) @map("is_active")
  
  // Foreign Keys
  centerId      String            @map("center_id") @db.Uuid
  
  // Relations
  user          User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  center        Center            @relation(fields: [centerId], references: [id])
  classes       Class[]           // 1 Teacher dạy nhiều Class
  contracts     Contract[]        // Hợp đồng lao động
  payrolls      Payroll[]         // Bảng lương
}
```

**🎯 Tại sao cần bảng Teacher:**
- **Thông tin chuyên môn**: Môn dạy, kinh nghiệm, bằng cấp
- **Quản lý lớp học**: 1 giáo viên có thể dạy nhiều lớp
- **Tài chính**: Lương, hợp đồng, thưởng
- **Lịch sử**: Theo dõi quá trình giảng dạy

#### **4. Student (Học sinh) - Kế thừa từ User**
```prisma
model Student {
  id             String              @id @default(uuid()) @db.Uuid
  userId         String              @unique @map("user_id") @db.Uuid
  studentCode    String              @unique @map("student_code") // HS001
  fullName       String              @map("full_name")
  dateOfBirth    DateTime?           @map("date_of_birth") @db.Date
  gender         String?
  schoolName     String?             @map("school_name") // Trường đang học
  schoolGrade    String?             @map("school_grade") // Lớp 6A
  interests      String[]            // Môn học quan tâm
  strengths      String[]            // Điểm mạnh
  weaknesses     String[]            // Điểm yếu
  
  // Foreign Keys
  gradeId        String?             @map("grade_id") @db.Uuid
  centerId       String              @map("center_id") @db.Uuid
  
  // Relations
  user           User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  grade          Grade?              @relation(fields: [gradeId], references: [id])
  center         Center              @relation(fields: [centerId], references: [id])
  enrollments    Enrollment[]        // 1 Student đăng ký nhiều Class
  attendances    Attendance[]        // Điểm danh
  assessments    Assessment[]        // Kiểm tra
  grades         Grade[]             // Điểm số
  progress       Progress[]          // Tiến độ học tập
}
```

**🎯 Tại sao cần bảng Student:**
- **Thông tin học tập**: Mã học sinh, trường, khối lớp
- **Sở thích**: Môn học quan tâm, điểm mạnh/yếu
- **Theo dõi**: Điểm danh, điểm số, tiến độ
- **Phân tích**: Đánh giá năng lực học tập

#### **5. Parent (Phụ huynh) - Kế thừa từ User**
```prisma
model Parent {
  id           String              @id @default(uuid()) @db.Uuid
  userId       String              @unique @map("user_id") @db.Uuid
  occupation   String?             // Nghề nghiệp
  workplace    String?             // Nơi làm việc
  relationship String?             // Mối quan hệ với học sinh
  
  // Relations
  user         User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  studentLinks StudentParentLink[] // Liên kết với học sinh
}
```

**🎯 Tại sao cần bảng Parent:**
- **Giao tiếp**: Thông báo, báo cáo cho phụ huynh
- **Quyết định**: Phụ huynh quyết định cho con học
- **Thanh toán**: Phụ huynh đóng học phí
- **Theo dõi**: Xem tiến độ học tập của con

---

### **📚 TIER 2: ACADEMIC STRUCTURE**

#### **6. Subject (Môn học) - Cấu trúc học tập**
```prisma
model Subject {
  id          String  @id @default(uuid()) @db.Uuid
  code        String  @unique  // MATH, LITERATURE, ENGLISH
  name        String           // Toán, Ngữ văn, Tiếng Anh
  shortName   String?          // TOÁN, VĂN, ANH
  description String?
  category    String           // core, elective, skill
  color       String?          // Màu sắc để phân biệt
  icon        String?          // Icon cho môn học
  isActive    Boolean @default(true) @map("is_active")
  
  // Relations
  classes     Class[]          // 1 Subject có nhiều Class
  curriculums Curriculum[]     // Chương trình học
  teachers    Teacher[]        // Giáo viên dạy môn này
}
```

**🎯 Tại sao cần bảng Subject:**
- **Phân loại**: Mỗi lớp chỉ dạy 1 môn
- **Quản lý**: Cấu hình riêng cho từng môn
- **Báo cáo**: Thống kê theo môn học
- **UI/UX**: Màu sắc, icon để phân biệt

#### **7. Grade (Khối lớp) - Cấu trúc học tập**
```prisma
model Grade {
  id          String  @id @default(uuid()) @db.Uuid
  name        String  @unique  // "Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"
  level       Int     @unique  // 6, 7, 8, 9
  description String?
  isActive    Boolean @default(true) @map("is_active")
  
  // Relations
  students    Student[]        // 1 Grade có nhiều Student
  classes     Class[]          // 1 Grade có nhiều Class
  curriculums Curriculum[]     // Chương trình theo khối
}
```

**🎯 Tại sao cần bảng Grade:**
- **Phân loại**: Học sinh theo khối lớp
- **Chương trình**: Mỗi khối có chương trình riêng
- **Học phí**: Giá khác nhau theo khối
- **Báo cáo**: Thống kê theo khối lớp

#### **8. Class (Lớp học) - Trung tâm của hệ thống**
```prisma
model Class {
  id                String           @id @default(uuid()) @db.Uuid
  name              String           // "Toán 6.1", "Văn 7.1", "Anh 8.1"
  description       String?          // "Lớp Toán 6 cơ bản"
  classType         String           // basic, advanced, exam_prep
  maxStudents       Int              @default(15) @map("max_students")
  currentStudents   Int              @default(0) @map("current_students")
  startDate         DateTime         @map("start_date") @db.Date
  endDate           DateTime         @map("end_date") @db.Date
  recurringSchedule Json?            // Lịch học định kỳ
  status            String           @default("draft")
  feePerMonth       Decimal          @map("fee_per_month") @db.Decimal(12, 2)
  
  // Foreign Keys - Mỗi lớp có 1 môn, 1 khối, 1 giáo viên
  teacherId         String           @map("teacher_id") @db.Uuid
  subjectId         String           @map("subject_id") @db.Uuid
  gradeId           String           @map("grade_id") @db.Uuid
  roomId            String?          @map("room_id") @db.Uuid
  centerId          String           @map("center_id") @db.Uuid
  
  // Relations
  teacher           Teacher          @relation(fields: [teacherId], references: [id])
  subject           Subject          @relation(fields: [subjectId], references: [id])
  grade             Grade            @relation(fields: [gradeId], references: [id])
  room              Room?            @relation(fields: [roomId], references: [id])
  center            Center           @relation(fields: [centerId], references: [id])
  sessions          ClassSession[]   // 1 Class có nhiều Session
  enrollments       Enrollment[]     // 1 Class có nhiều Enrollment
  assessments       Assessment[]     // 1 Class có nhiều Assessment
  homeworks         Homework[]       // 1 Class có nhiều Homework
}
```

**🎯 Tại sao cần bảng Class:**
- **Trung tâm hệ thống**: Kết nối tất cả các thành phần
- **Mỗi lớp 1 môn**: Đảm bảo ràng buộc business
- **Quản lý sức chứa**: Số lượng học sinh tối đa
- **Lịch học**: Thời gian, phòng học, giáo viên
- **Học phí**: Giá theo lớp cụ thể

#### **9. Room (Phòng học) - Cơ sở vật chất**
```prisma
model Room {
  id              String           @id @default(uuid()) @db.Uuid
  name            String           // "Phòng 101", "Phòng A1"
  capacity        Int?             // Sức chứa
  floor           String?          // Tầng
  equipment       Json?            // Thiết bị: projector, whiteboard
  isActive        Boolean          @default(true) @map("is_active")
  
  // Foreign Keys
  centerId        String           @map("center_id") @db.Uuid
  
  // Relations
  center          Center           @relation(fields: [centerId], references: [id])
  classes         Class[]          // 1 Room có thể có nhiều Class
  sessions        ClassSession[]   // 1 Room có nhiều Session
}
```

**🎯 Tại sao cần bảng Room:**
- **Quản lý phòng**: Sức chứa, thiết bị, vị trí
- **Lịch học**: Phòng nào, khi nào
- **Tối ưu**: Sử dụng phòng hiệu quả
- **Báo cáo**: Thống kê sử dụng phòng

---

### **📋 TIER 3: STUDENT MANAGEMENT**

#### **10. Enrollment (Đăng ký học) - Kết nối Student và Class**
```prisma
model Enrollment {
  id             BigInt    @id @default(autoincrement())
  studentId      String    @map("student_id") @db.Uuid
  classId        String    @map("class_id") @db.Uuid
  enrolledAt     DateTime  @default(now()) @map("enrolled_at") @db.Timestamptz(6)
  status         String    @default("active") // active, inactive, completed, cancelled
  originalFee    Decimal?  @map("original_fee") @db.Decimal(12, 2)
  actualFee      Decimal?  @map("actual_fee") @db.Decimal(12, 2)
  discountAmount Decimal?  @map("discount_amount") @db.Decimal(12, 2)
  paymentPlan    String?   @map("payment_plan") // monthly, quarterly, full
  notes          String?
  
  // Relations
  student        Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  class          Class     @relation(fields: [classId], references: [id], onDelete: Cascade)
  
  @@unique([studentId, classId]) // 1 học sinh chỉ đăng ký 1 lần/lớp
}
```

**🎯 Tại sao cần bảng Enrollment:**
- **Kết nối**: Student và Class
- **Quản lý đăng ký**: Thời gian, trạng thái
- **Học phí**: Giá gốc, giá thực tế, giảm giá
- **Thanh toán**: Kế hoạch thanh toán
- **Ràng buộc**: 1 học sinh chỉ đăng ký 1 lần/lớp

#### **11. ClassSession (Buổi học) - Chi tiết từng buổi**
```prisma
model ClassSession {
  id          String       @id @default(uuid()) @db.Uuid
  classId     String       @map("class_id") @db.Uuid
  sessionDate DateTime     @map("session_date") @db.Date
  startTime   String       @map("start_time")
  endTime     String       @map("end_time")
  roomId      String?      @map("room_id") @db.Uuid
  status      String       @default("scheduled") // scheduled, completed, cancelled
  notes       String?      // Ghi chú buổi học
  createdAt   DateTime     @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Relations
  class       Class        @relation(fields: [classId], references: [id], onDelete: Cascade)
  room        Room?        @relation(fields: [roomId], references: [id])
  attendances Attendance[] // 1 Session có nhiều Attendance
}
```

**🎯 Tại sao cần bảng ClassSession:**
- **Chi tiết**: Tách biệt lịch học định kỳ và buổi học cụ thể
- **Linh hoạt**: Có thể thay đổi phòng, thời gian từng buổi
- **Theo dõi**: Trạng thái từng buổi học
- **Điểm danh**: Ghi nhận sự có mặt

#### **12. Attendance (Điểm danh) - Theo dõi sự có mặt**
```prisma
model Attendance {
  id             BigInt       @id @default(autoincrement())
  f      String       @map("session_id") @db.Uuid
  studentId      String       @map("student_id") @db.Uuid
  status         String       // present, absent, late, excused
  note           String?      // Ghi chú lý do vắng mặt
  recordedBy     String       @map("recorded_by") @db.Uuid
  recordedAt     DateTime     @default(now()) @map("recorded_at") @db.Timestamptz(6)
  
  // Relations
  session        ClassSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  student        Student      @relation(fields: [studentId], references: [id], onDelete: Cascade)
  recordedByUser User         @relation("RecordedBy", fields: [recordedBy], references: [id])
  
  @@unique([sessionId, studentId]) // 1 học sinh chỉ có 1 điểm danh/buổi
}
```

**🎯 Tại sao cần bảng Attendance:**
- **Theo dõi**: Sự có mặt của học sinh
- **Chi tiết**: Trạng thái, lý do vắng mặt 
- **Audit**: Ai điểm danh, khi nào
- **Báo cáo**: Tỷ lệ điểm danh

#### **13. Assessment (Kiểm tra) - Đánh giá học tập**
```prisma
model Assessment {
  id          String   @id @default(uuid()) @db.Uuid
  classId     String   @map("class_id") @db.Uuid
  name        String   // "Kiểm tra 15 phút", "Thi giữa kỳ"
  type        String   // quiz, test, exam, final
  description String?
  maxScore    Decimal  @map("max_score") @db.Decimal(5, 2)
  date        DateTime @db.Date
  duration    Int?     // Thời gian làm bài (phút)
  difficulty  String?  // easy, medium, hard
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Relations
  class       Class    @relation(fields: [classId], references: [id], onDelete: Cascade)
  grades      Grade[]  // 1 Assessment có nhiều Grade
}
```

**🎯 Tại sao cần bảng Assessment:**
- **Đánh giá**: Kiểm tra học tập định kỳ
- **Phân loại**: Quiz, test, exam, final
- **Cấu hình**: Điểm tối đa, thời gian, độ khó
- **Lịch sử**: Theo dõi quá trình kiểm tra

#### **14. Grade (Điểm số) - Kết quả kiểm tra**
```prisma
model Grade {
  id           BigInt     @id @default(autoincrement())
  assessmentId String     @map("assessment_id") @db.Uuid
  studentId    String     @map("student_id") @db.Uuid
  score        Decimal?   @db.Decimal(5, 2)
  feedback     String?    // Nhận xét của giáo viên
  gradedBy     String     @map("graded_by") @db.Uuid
  gradedAt     DateTime   @default(now()) @map("graded_at") @db.Timestamptz(6)
  
  // Relations
  assessment   Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  student      Student    @relation(fields: [studentId], references: [id], onDelete: Cascade)
  gradedByUser User       @relation("GradedBy", fields: [gradedBy], references: [id])
  
  @@unique([assessmentId, studentId]) // 1 học sinh chỉ có 1 điểm/kiểm tra
}
```

**🎯 Tại sao cần bảng Grade:**
- **Kết quả**: Điểm số của học sinh
- **Phản hồi**: Nhận xét của giáo viên
- **Audit**: Ai chấm điểm, khi nào
- **Phân tích**: Thống kê điểm số

---

### **💰 TIER 4: FINANCIAL MANAGEMENT**

#### **15. FeeStructure (Cấu trúc học phí) - Định nghĩa giá**
```prisma
model FeeStructure {
  id          String      @id @default(uuid()) @db.Uuid
  name        String      // "Học phí Toán 6", "Học phí Văn 7"
  description String?
  amount      Decimal     @db.Decimal(12, 2)
  period      String      // monthly, quarterly, yearly
  subjectId   String?     @map("subject_id") @db.Uuid
  gradeId     String?     @map("grade_id") @db.Uuid
  classType   String?     @map("class_type") // basic, advanced, exam_prep
  isActive    Boolean     @default(true) @map("is_active")
  validFrom   DateTime?   @map("valid_from") @db.Date
  validTo     DateTime?   @map("valid_to") @db.Date
  createdAt   DateTime    @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Relations
  subject     Subject?    @relation(fields: [subjectId], references: [id])
  grade       Grade?      @relation(fields: [gradeId], references: [id])
  feeRecords  FeeRecord[] // 1 FeeStructure có nhiều FeeRecord
}
```

**🎯 Tại sao cần bảng FeeStructure:**
- **Định giá**: Giá theo môn, khối, loại lớp
- **Linh hoạt**: Có thể thay đổi giá theo thời gian
- **Phân loại**: Giá khác nhau cho từng loại
- **Áp dụng**: Tự động tính giá cho học sinh

#### **16. FeeRecord (Học phí học sinh) - Ghi nhận học phí**
```prisma
model FeeRecord {
  id             String       @id @default(uuid()) @db.Uuid
  studentId      String       @map("student_id") @db.Uuid
  classId        String       @map("class_id") @db.Uuid
  feeStructureId String       @map("fee_structure_id") @db.Uuid
  amount         Decimal      @db.Decimal(12, 2)
  dueDate        DateTime     @map("due_date") @db.Date
  paidAmount     Decimal      @default(0) @map("paid_amount") @db.Decimal(12, 2)
  status         String       @default("pending") // pending, paid, overdue, partial
  discount       Decimal?     @default(0) @db.Decimal(12, 2)
  notes          String?
  createdAt      DateTime     @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Relations
  student        Student      @relation(fields: [studentId], references: [id])
  class          Class        @relation(fields: [classId], references: [id])
  feeStructure   FeeStructure @relation(fields: [feeStructureId], references: [id])
  payments       Payment[]    // 1 FeeRecord có nhiều Payment
}
```

**🎯 Tại sao cần bảng FeeRecord:**
- **Cá nhân hóa**: Học phí riêng cho từng học sinh
- **Theo dõi**: Trạng thái thanh toán
- **Giảm giá**: Áp dụng giảm giá cá nhân
- **Lịch sử**: Theo dõi quá trình thanh toán

#### **17. Payment (Thanh toán) - Ghi nhận giao dịch**
```prisma
model Payment {
  id          String    @id @default(uuid()) @db.Uuid
  feeRecordId String    @map("fee_record_id") @db.Uuid
  studentId   String    @map("student_id") @db.Uuid
  amount      Decimal   @db.Decimal(12, 2)
  method      String    // cash, bank_transfer, credit_card
  status      String    @default("completed") // pending, completed, failed, refunded
  reference   String?   // Mã tham chiếu giao dịch
  paidAt      DateTime  @default(now()) @map("paid_at") @db.Timestamptz(6)
  notes       String?
  
  // Relations
  feeRecord   FeeRecord @relation(fields: [feeRecordId], references: [id])
  student     Student   @relation(fields: [studentId], references: [id])
}
```

**🎯 Tại sao cần bảng Payment:**
- **Giao dịch**: Ghi nhận từng lần thanh toán
- **Phương thức**: Tiền mặt, chuyển khoản, thẻ
- **Trạng thái**: Thành công, thất bại, hoàn tiền
- **Audit**: Theo dõi giao dịch tài chính

---

### **🔔 TIER 5: SUPPORT SYSTEMS**

#### **18. Notification (Thông báo) - Giao tiếp**
```prisma
model Notification {
  id            BigInt    @id @default(autoincrement())
  title         String
  body          String
  type          String    @default("general") // general, payment, academic, system
  audience      Json?     // Đối tượng nhận: {roles: ["student"], classes: ["class1"]}
  priority      String    @default("normal") // low, normal, high, urgent
  scheduledFor  DateTime? @map("scheduled_for") @db.Timestamptz(6)
  sentAt        DateTime? @map("sent_at") @db.Timestamptz(6)
  createdBy     String    @map("created_by") @db.Uuid
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Relations
  createdByUser User      @relation("CreatedBy", fields: [createdBy], references: [id])
}
```

**🎯 Tại sao cần bảng Notification:**
- **Giao tiếp**: Thông báo cho học sinh, phụ huynh
- **Phân loại**: Loại thông báo khác nhau
- **Lịch trình**: Gửi theo lịch
- **Audit**: Ai tạo, khi nào gửi

#### **19. AuditLog (Nhật ký) - Theo dõi thay đổi**
```prisma
model AuditLog {
  id          BigInt   @id @default(autoincrement())
  userId      String   @map("user_id") @db.Uuid
  action      String   // create, update, delete, login, logout
  tableName   String   @map("table_name")
  recordId    String?  @map("record_id")
  oldValues   Json?    @map("old_values")
  newValues   Json?    @map("new_values")
  ipAddress   String?  @map("ip_address")
  userAgent   String?  @map("user_agent")
  timestamp   DateTime @default(now()) @db.Timestamptz(6)
  
  // Relations
  performedBy User     @relation("PerformedBy", fields: [userId], references: [id])
}
```

**🎯 Tại sao cần bảng AuditLog:**
- **Bảo mật**: Theo dõi mọi thay đổi
- **Compliance**: Tuân thủ quy định
- **Debug**: Tìm lỗi, khôi phục dữ liệu
- **Audit**: Kiểm tra hoạt động hệ thống

---

## 🔗 **SƠ ĐỒ MỐI QUAN HỆ CHÍNH**

### **📊 Mối quan hệ 1-1:**
```
User (1) ←→ (1) Teacher
User (1) ←→ (1) Student  
User (1) ←→ (1) Parent
```

### **📊 Mối quan hệ 1-N:**
```
Center (1) ←→ (N) Teacher
Center (1) ←→ (N) Student
Center (1) ←→ (N) Room
Center (1) ←→ (N) Class

Subject (1) ←→ (N) Class
Grade (1) ←→ (N) Class
Teacher (1) ←→ (N) Class
Room (1) ←→ (N) Class

Class (1) ←→ (N) ClassSession
Class (1) ←→ (N) Enrollment
Class (1) ←→ (N) Assessment

Student (1) ←→ (N) Enrollment
Student (1) ←→ (N) Attendance
Student (1) ←→ (N) Grade
```

### **📊 Mối quan hệ N-N:**
```
Student (N) ←→ (N) Class (qua Enrollment)
Student (N) ←→ (N) Parent (qua StudentParentLink)
```

---

## 🎯 **TẠI SAO THIẾT KẾ NHƯ VẬY?**

### **✅ Nguyên tắc thiết kế:**

#### **1. Normalization (Chuẩn hóa):**
- **Tách biệt**: Mỗi bảng có 1 nhiệm vụ rõ ràng
- **Tránh trùng lặp**: Dữ liệu không bị lặp lại
- **Linh hoạt**: Dễ dàng thay đổi và mở rộng

#### **2. Business Rules (Quy tắc nghiệp vụ):**
- **Mỗi lớp 1 môn**: Ràng buộc trong bảng Class
- **1 học sinh 1 đăng ký/lớp**: Unique constraint
- **Phân quyền**: Role-based access control

#### **3. Performance (Hiệu suất):**
- **Indexes**: Tối ưu query performance
- **Foreign Keys**: Đảm bảo data integrity
- **Partitioning**: Chia nhỏ bảng lớn

#### **4. Scalability (Khả năng mở rộng):**
- **UUID**: Hỗ trợ distributed system
- **JSON fields**: Linh hoạt cho dữ liệu phức tạp
- **Audit trail**: Theo dõi mọi thay đổi

### **🔧 Lợi ích của thiết kế:**

#### **1. Quản lý dễ dàng:**
- **Tách biệt**: Mỗi chức năng có bảng riêng
- **Rõ ràng**: Mối quan hệ dễ hiểu
- **Linh hoạt**: Thay đổi không ảnh hưởng toàn hệ thống

#### **2. Bảo mật cao:**
- **Phân quyền**: Role-based access
- **Audit**: Theo dõi mọi hoạt động
- **Validation**: Ràng buộc dữ liệu chặt chẽ

#### **3. Hiệu suất tốt:**
- **Indexes**: Query nhanh
- **Normalization**: Giảm dung lượng
- **Caching**: Hỗ trợ cache hiệu quả

#### **4. Mở rộng dễ dàng:**
- **Modular**: Thêm tính năng mới
- **API**: Hỗ trợ nhiều client
- **Integration**: Kết nối hệ thống khác

---

## 🚀 **KẾT LUẬN**

### **📋 Tóm tắt:**
Database được thiết kế theo kiến trúc 5 tầng với mối quan hệ rõ ràng, đảm bảo:
- **Quản lý hiệu quả**: Tất cả chức năng cần thiết
- **Bảo mật cao**: Phân quyền và audit đầy đủ
- **Hiệu suất tốt**: Tối ưu cho trung tâm dạy học
- **Mở rộng dễ dàng**: Hỗ trợ phát triển tương lai

### **🎯 Mục tiêu đạt được:**
- ✅ Quản lý học sinh, giáo viên, lớp học
- ✅ Theo dõi điểm danh, điểm số, tiến độ
- ✅ Quản lý học phí, thanh toán
- ✅ Báo cáo, thống kê chi tiết
- ✅ Giao tiếp, thông báo hiệu quả

**Chúc bạn thiết kế database thành công! 🎓**
