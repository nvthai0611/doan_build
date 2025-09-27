# 📚 Database Design cho Trung tâm Dạy Nhiều Môn
## Mỗi lớp chỉ dạy 1 môn: Toán 6.1, Văn 7.1, Anh 8.1...

---

## 🎯 **ĐẶC ĐIỂM TRUNG TÂM DẠY NHIỀU MÔN**

### **📚 Các môn học:**
- **Toán**: Đại số, Hình học, Số học
- **Văn**: Ngữ văn, Tập làm văn, Đọc hiểu
- **Anh**: Ngữ pháp, Từ vựng, Giao tiếp
- **Lý**: Vật lý cơ bản
- **Hóa**: Hóa học cơ bản
- **Sinh**: Sinh học cơ bản

### **🎓 Cấu trúc lớp học:**
- **Mỗi lớp chỉ dạy 1 môn**: Toán 6.1, Văn 7.1, Anh 8.1...
- **Khối lớp**: 6, 7, 8, 9
- **Phân loại**: Cơ bản, Nâng cao, Luyện thi
- **Ví dụ**: Toán 6.1, Toán 6.2, Văn 7.1, Anh 8.1...

### **👥 Đối tượng:**
- **Học sinh cấp 2**: Lớp 6, 7, 8, 9
- **Phụ huynh**: Theo dõi tiến độ học tập
- **Giáo viên**: Chuyên dạy từng môn
- **Admin**: Quản lý trung tâm

---

## 🏗️ **THIẾT KẾ DATABASE CHO TRUNG TÂM NHIỀU MÔN**

### **📊 Cấu trúc bảng chính:**

```
🏢 CENTER MANAGEMENT
├── Center (Trung tâm)
├── User (Người dùng)
├── Teacher (Giáo viên)
├── Student (Học sinh)
└── Parent (Phụ huynh)

📚 ACADEMIC MANAGEMENT
├── Subject (Môn học: Toán, Văn, Anh...)
├── Grade (Khối lớp: 6, 7, 8, 9)
├── Class (Lớp học: Toán 6.1, Văn 7.1...)
├── ClassSession (Buổi học)
├── Room (Phòng học)
├── Curriculum (Chương trình học)
└── Lesson (Bài học)

📋 STUDENT MANAGEMENT
├── Enrollment (Đăng ký học)
├── Attendance (Điểm danh)
├── Assessment (Kiểm tra)
├── Grade (Điểm số)
├── Homework (Bài tập về nhà)
└── Progress (Tiến độ học tập)

💰 FINANCIAL MANAGEMENT
├── FeeStructure (Học phí theo môn và khối)
├── FeeRecord (Học phí học sinh)
├── Payment (Thanh toán)
└── Discount (Giảm giá)
```

---

## 📝 **CHI TIẾT CÁC BẢNG QUAN TRỌNG**

### **📚 1. BẢNG MÔN HỌC (Subjects)**
```prisma
model Subject {
  id          String  @id @default(uuid()) @db.Uuid
  code        String  @unique  // MATH, LITERATURE, ENGLISH, PHYSICS
  name        String           // Toán, Ngữ văn, Tiếng Anh, Vật lý
  shortName   String?          // TOÁN, VĂN, ANH, LÝ
  description String?
  category    String           // core, elective, skill
  color       String?          // Màu sắc để phân biệt
  icon        String?          // Icon cho môn học
  isActive    Boolean @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Relations
  classes     Class[]
  curriculums Curriculum[]
  teachers    Teacher[]
  
  @@map("subjects")
}
```

### **🎓 2. BẢNG KHỐI LỚP (Grades)**
```prisma
model Grade {
  id          String  @id @default(uuid()) @db.Uuid
  name        String  @unique  // "Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"
  level       Int     @unique  // 6, 7, 8, 9
  description String?
  isActive    Boolean @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Relations
  students    Student[]
  classes     Class[]
  curriculums Curriculum[]
  
  @@map("grades")
}
```

### **🎓 3. BẢNG LỚP HỌC (Classes)**
```prisma
model Class {
  id                String           @id @default(uuid()) @db.Uuid
  name              String           // "Toán 6.1", "Văn 7.1", "Anh 8.1"
  description       String?          // "Lớp Toán 6 cơ bản", "Lớp Văn 7 nâng cao"
  classType         String           @map("class_type") // basic, advanced, exam_prep
  maxStudents       Int              @default(15) @map("max_students")
  currentStudents   Int              @default(0) @map("current_students")
  startDate         DateTime         @map("start_date") @db.Date
  endDate           DateTime         @map("end_date") @db.Date
  recurringSchedule Json?            @map("recurring_schedule") // Lịch học định kỳ
  status            String           @default("draft") // draft, active, completed, cancelled
  feePerMonth       Decimal          @map("fee_per_month") @db.Decimal(12, 2)
  createdAt         DateTime         @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Foreign Keys
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
  sessions          ClassSession[]
  enrollments       Enrollment[]
  assessments       Assessment[]
  homeworks         Homework[]
  
  @@map("classes")
}
```

### **👨‍🏫 4. BẢNG GIÁO VIÊN (Teachers)**
```prisma
model Teacher {
  id            String            @id @default(uuid()) @db.Uuid
  userId        String            @unique @map("user_id") @db.Uuid
  hireDate      DateTime?         @map("hire_date") @db.Date
  contractEnd   DateTime?         @map("contract_end") @db.Date
  subjects      String[]          // Các môn có thể dạy: ["MATH", "LITERATURE"]
  salary        Decimal?          @db.Decimal(12, 2)
  birthDate     DateTime?         @map("birth_date") @db.Date
  gender        String?
  experience    Int?              // Số năm kinh nghiệm
  qualifications String?          // Bằng cấp, chứng chỉ
  bio           String?           // Giới thiệu bản thân
  isActive      Boolean           @default(true) @map("is_active")
  createdAt     DateTime          @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt     DateTime          @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)
  
  // Foreign Keys
  centerId      String            @map("center_id") @db.Uuid
  
  // Relations
  user          User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  center        Center            @relation(fields: [centerId], references: [id])
  classes       Class[]
  contracts     Contract[]
  leaveRequests LeaveRequest[]
  payrolls      Payroll[]
  documents     TeacherDocument[]
  
  @@map("teachers")
}
```

### **👨‍🎓 5. BẢNG HỌC SINH (Students)**
```prisma
model Student {
  id             String              @id @default(uuid()) @db.Uuid
  userId         String              @unique @map("user_id") @db.Uuid
  studentCode    String              @unique @map("student_code") // HS001, HS002
  fullName       String              @map("full_name")
  dateOfBirth    DateTime?           @map("date_of_birth") @db.Date
  gender         String?             // male, female
  address        String?
  schoolName     String?             @map("school_name") // Trường đang học
  schoolGrade    String?             @map("school_grade") // Lớp 6A, 7B
  parentPhone    String?             @map("parent_phone")
  parentEmail    String?             @map("parent_email")
  emergencyContact String?           @map("emergency_contact")
  interests      String[]            // Môn học quan tâm: ["MATH", "ENGLISH"]
  strengths      String[]            // Điểm mạnh: ["MATH", "LITERATURE"]
  weaknesses     String[]            // Điểm yếu: ["ENGLISH", "PHYSICS"]
  notes          String?             // Ghi chú đặc biệt
  isActive       Boolean             @default(true) @map("is_active")
  createdAt      DateTime            @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt      DateTime            @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)
  
  // Foreign Keys
  gradeId        String?             @map("grade_id") @db.Uuid
  centerId       String              @map("center_id") @db.Uuid
  
  // Relations
  user           User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  grade          Grade?              @relation(fields: [gradeId], references: [id])
  center         Center              @relation(fields: [centerId], references: [id])
  attendances    Attendance[]
  enrollments    Enrollment[]
  assessments    Assessment[]
  grades         Grade[]
  homeworks      Homework[]
  progress       Progress[]
  parentLinks    StudentParentLink[]
  
  @@map("students")
}
```

### **📚 6. BẢNG CHƯƠNG TRÌNH HỌC (Curriculum)**
```prisma
model Curriculum {
  id          String  @id @default(uuid()) @db.Uuid
  name        String  // "Chương trình Toán 6", "Chương trình Văn 7"
  description String?
  subjectId   String  @map("subject_id") @db.Uuid
  gradeId     String  @map("grade_id") @db.Uuid
  classType   String  @map("class_type") // basic, advanced, exam_prep
  duration    Int     // Số buổi học
  isActive    Boolean @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Relations
  subject     Subject @relation(fields: [subjectId], references: [id])
  grade       Grade   @relation(fields: [gradeId], references: [id])
  lessons     Lesson[]
  classes     Class[]
  
  @@map("curriculums")
}
```

### **📖 7. BẢNG BÀI HỌC (Lessons)**
```prisma
model Lesson {
  id          String  @id @default(uuid()) @db.Uuid
  title       String  // "Phương trình bậc nhất", "Tả người", "Present Simple"
  description String?
  content     String? // Nội dung bài học
  objectives  String? // Mục tiêu học tập
  order       Int     // Thứ tự trong chương trình
  duration    Int     // Thời gian (phút)
  difficulty  String? // easy, medium, hard
  isActive    Boolean @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Foreign Keys
  curriculumId String @map("curriculum_id") @db.Uuid
  
  // Relations
  curriculum   Curriculum @relation(fields: [curriculumId], references: [id])
  
  @@map("lessons")
}
```

### **📝 8. BẢNG BÀI TẬP VỀ NHÀ (Homework)**
```prisma
model Homework {
  id          String    @id @default(uuid()) @db.Uuid
  title       String    // "Bài tập về nhà tuần 1 - Phương trình"
  description String?
  content     String    // Nội dung bài tập
  dueDate     DateTime  @map("due_date") @db.Date
  maxScore    Decimal?  @map("max_score") @db.Decimal(5, 2)
  isRequired  Boolean   @default(true) @map("is_required")
  difficulty  String?   // easy, medium, hard
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Foreign Keys
  classId     String    @map("class_id") @db.Uuid
  teacherId   String    @map("teacher_id") @db.Uuid
  
  // Relations
  class       Class     @relation(fields: [classId], references: [id])
  teacher     Teacher   @relation(fields: [teacherId], references: [id])
  submissions HomeworkSubmission[]
  
  @@map("homeworks")
}
```

### **📊 9. BẢNG KIỂM TRA (Assessment)**
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
  grades      Grade[]
  
  @@map("assessments")
}
```

### **📈 10. BẢNG TIẾN ĐỘ HỌC TẬP (Progress)**
```prisma
model Progress {
  id              String    @id @default(uuid()) @db.Uuid
  studentId       String    @map("student_id") @db.Uuid
  classId         String    @map("class_id") @db.Uuid
  period          String    // "Tháng 1", "Học kỳ 1"
  attendanceRate  Decimal   @map("attendance_rate") @db.Decimal(5, 2) // Tỷ lệ điểm danh
  averageScore    Decimal?  @map("average_score") @db.Decimal(5, 2) // Điểm trung bình
  homeworkScore   Decimal?  @map("homework_score") @db.Decimal(5, 2) // Điểm bài tập
  testScore       Decimal?  @map("test_score") @db.Decimal(5, 2) // Điểm kiểm tra
  subjectSkills   Json?     @map("subject_skills") // Kỹ năng theo môn
  behavior        String?   // Đánh giá hành vi
  comments        String?   // Nhận xét của giáo viên
  recommendations String?   // Khuyến nghị
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  
  // Relations
  student         Student   @relation(fields: [studentId], references: [id])
  class           Class     @relation(fields: [classId], references: [id])
  
  @@unique([studentId, classId, period])
  @@map("progress")
}
```

---

## 🎯 **QUY TRÌNH HOẠT ĐỘNG CỦA TRUNG TÂM NHIỀU MÔN**

### **📚 1. Quy trình đăng ký học:**
```
1. Phụ huynh/Học sinh liên hệ trung tâm
2. Tư vấn môn học và khối lớp phù hợp
3. Kiểm tra trình độ (nếu cần)
4. Chọn lớp cụ thể (Toán 6.1, Văn 7.1, Anh 8.1...)
5. Đăng ký lớp học
6. Thanh toán học phí
7. Bắt đầu học tập
```

### **📅 2. Quy trình học tập:**
```
1. Học sinh đến lớp theo lịch
2. Giáo viên điểm danh
3. Dạy bài học theo chương trình môn học
4. Giao bài tập về nhà
5. Kiểm tra định kỳ (15 phút, 1 tiết, thi)
6. Đánh giá tiến độ học tập
7. Báo cáo cho phụ huynh
```

### **💰 3. Quy trình tài chính:**
```
1. Tính học phí theo môn học và khối lớp
2. Áp dụng giảm giá (nếu có)
3. Thu học phí hàng tháng
4. Theo dõi thanh toán
5. Xử lý hoàn tiền (nếu cần)
```

---

## 📊 **BÁO CÁO QUAN TRỌNG CHO TRUNG TÂM NHIỀU MÔN**

### **📈 1. Báo cáo học tập:**
- **Điểm danh**: Tỷ lệ có mặt của học sinh
- **Điểm số**: Điểm trung bình theo môn học
- **Tiến độ**: So sánh trước và sau
- **Kỹ năng**: Theo từng môn học
- **Xếp hạng**: Thứ tự trong lớp

### **💰 2. Báo cáo tài chính:**
- **Doanh thu**: Theo môn học, tháng, quý, năm
- **Học phí**: Thu được và còn nợ
- **Chi phí**: Lương giáo viên, cơ sở vật chất
- **Lợi nhuận**: Phân tích hiệu quả

### **👥 3. Báo cáo quản lý:**
- **Số lượng học sinh**: Theo môn học, khối lớp
- **Giáo viên**: Tải giảng dạy, hiệu quả
- **Phòng học**: Sử dụng, tối ưu
- **Chất lượng**: Đánh giá từ phụ huynh

---

## 🚀 **TRIỂN KHAI VÀ SỬ DỤNG**

### **📋 Checklist triển khai:**
- [ ] Tạo database PostgreSQL
- [ ] Cấu hình Prisma
- [ ] Chạy migrations
- [ ] Seed dữ liệu mẫu
- [ ] Test các chức năng chính
- [ ] Deploy lên production

### **🎯 Ưu tiên phát triển:**
1. **Quản lý môn học**: Tạo và quản lý các môn
2. **Quản lý lớp học**: Tạo lớp theo môn và khối
3. **Quản lý học sinh**: Đăng ký, thông tin
4. **Điểm danh**: Theo dõi sự có mặt
5. **Quản lý học phí**: Thu phí, thanh toán
6. **Báo cáo**: Thống kê, xuất báo cáo

---

## 💡 **LỜI KHUYÊN CHO TRUNG TÂM NHIỀU MÔN**

### **✅ Nên làm:**
- **Phân loại rõ ràng**: Mỗi lớp chỉ dạy 1 môn
- **Theo dõi kỹ năng**: Theo từng môn học
- **Giao tiếp tốt**: Thông báo cho phụ huynh thường xuyên
- **Báo cáo chi tiết**: Theo môn học và khối lớp

### **❌ Tránh:**
- **Quá phức tạp**: Không cần quá nhiều tính năng
- **Bỏ qua phụ huynh**: Họ là người quyết định
- **Thiếu báo cáo**: Phụ huynh cần thấy kết quả
- **Không linh hoạt**: Cần điều chỉnh theo nhu cầu

**Chúc bạn thiết kế database thành công cho trung tâm nhiều môn! 📚**
