# ĐÁNH GIÁ DATABASE SCHEMA CHO NGHIỆP VỤ ĐĂNG KÝ KHÓA HỌC

## TỔNG QUAN ĐÁNH GIÁ

Database schema hiện tại **KHÁ TỐT** và phù hợp với nghiệp vụ đăng ký khóa học, nhưng có một số điểm cần cải thiện.

---

## ✅ ĐIỂM MẠNH

### 1. **Cấu trúc User-Role linh hoạt**
- ✅ `User` table có thể handle nhiều role (parent, student, teacher)
- ✅ `Role` và `Permission` system đầy đủ
- ✅ `UserSession` cho authentication

### 2. **Quan hệ Parent-Student tốt**
- ✅ `Parent` 1:N `Student` relationship
- ✅ `Student` có `parentId` để liên kết
- ✅ Cascade delete khi xóa parent

### 3. **Enrollment system hoàn chỉnh**
- ✅ `Enrollment` table với status tracking
- ✅ `StudentClassRequest` cho approval workflow
- ✅ `TeacherClassAssignment` cho phân công giáo viên

### 4. **Contract system đầy đủ**
- ✅ `ContractTemplate` cho templates
- ✅ `ContractUpload` cho upload hợp đồng
- ✅ `ContractExpiryNotification` cho nhắc nhở

### 5. **Audit và Notification**
- ✅ `AuditLog` cho tracking hoạt động
- ✅ `Notification` system
- ✅ `UserSession` cho session management

---

## ⚠️ ĐIỂM CẦN CẢI THIỆN

### 1. **Thiếu Academic Year Management**
```sql
-- CẦN THÊM: Academic Year tracking
model AcademicYear {
  id        String   @id @default(cuid())
  year      String   @unique // "2023-2024", "2024-2025"
  startDate DateTime
  endDate   DateTime
  isActive  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

-- CẦN THÊM: Liên kết với các bảng
model Class {
  academicYear String? @map("academic_year") // CẦN THÊM
  // ... existing fields
}

model Enrollment {
  academicYear String? @map("academic_year") // CẦN THÊM
  // ... existing fields
}
```

### 2. **Thiếu Branch/Center Management**
```sql
-- CẦN THÊM: Branch/Center table
model Branch {
  id        String    @id @default(uuid()) @db.Uuid
  name      String
  address   String?
  phone     String?
  isActive  Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  students  Student[]
  teachers  Teacher[]
  classes   Class[]
}

-- CẦN THÊM: Liên kết với Student
model Student {
  branchId String? @map("branch_id") @db.Uuid // CẦN THÊM
  branch   Branch? @relation(fields: [branchId], references: [id])
  // ... existing fields
}
```

### 3. **Thiếu Semester Management**
```sql
-- CẦN THÊM: Semester table
model Semester {
  id            String   @id @default(uuid()) @db.Uuid
  name          String   // "Học kỳ 1", "Học kỳ 2"
  academicYear  String   // "2023-2024"
  startDate     DateTime
  endDate       DateTime
  isActive      Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

-- CẦN THÊM: Liên kết với Enrollment
model Enrollment {
  semesterId String? @map("semester_id") @db.Uuid // CẦN THÊM
  semester   Semester? @relation(fields: [semesterId], references: [id])
  // ... existing fields
}
```

### 4. **ContractUpload cần cải thiện**
```sql
-- CẦN SỬA: ContractUpload cho student enrollment
model ContractUpload {
  // CẦN THÊM: studentId cho student contracts
  studentId String? @map("student_id") @db.Uuid
  student   Student? @relation(fields: [studentId], references: [id])
  
  // CẦN THÊM: contractType enum
  contractType ContractType @map("contract_type")
  
  // ... existing fields
}

enum ContractType {
  STUDENT_ENROLLMENT
  TEACHER_CONTRACT
  PARENT_AGREEMENT
}
```

### 5. **Thiếu Status Enums**
```sql
-- CẦN THÊM: Status enums cho consistency
enum EnrollmentStatus {
  PENDING
  ACTIVE
  COMPLETED
  CANCELLED
  SUSPENDED
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

enum ContractStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
}
```

---

## 🔧 CÁC CẢI THIỆN CẦN THIẾT

### 1. **Thêm Indexes cho Performance**
```sql
-- CẦN THÊM: Indexes
CREATE INDEX idx_student_parent_id ON students(parent_id);
CREATE INDEX idx_enrollment_student_class ON enrollments(student_id, class_id);
CREATE INDEX idx_enrollment_status ON enrollments(status);
CREATE INDEX idx_contract_upload_status ON contract_uploads(status);
CREATE INDEX idx_student_class_request_status ON student_class_requests(status);
```

### 2. **Thêm Constraints**
```sql
-- CẦN THÊM: Check constraints
ALTER TABLE enrollments ADD CONSTRAINT chk_enrollment_status 
CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'suspended'));

ALTER TABLE student_class_requests ADD CONSTRAINT chk_request_status 
CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));

ALTER TABLE contract_uploads ADD CONSTRAINT chk_contract_status 
CHECK (status IN ('pending', 'approved', 'rejected', 'expired'));
```

### 3. **Thêm Triggers cho Auto-update**
```sql
-- CẦN THÊM: Trigger để auto-update current_students
CREATE OR REPLACE FUNCTION update_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE classes SET current_students = current_students + 1 
    WHERE id = NEW.class_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'active' AND NEW.status = 'active' THEN
      UPDATE classes SET current_students = current_students + 1 
      WHERE id = NEW.class_id;
    ELSIF OLD.status = 'active' AND NEW.status != 'active' THEN
      UPDATE classes SET current_students = current_students - 1 
      WHERE id = NEW.class_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    UPDATE classes SET current_students = current_students - 1 
    WHERE id = OLD.class_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_class_student_count
  AFTER INSERT OR UPDATE OR DELETE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_class_student_count();
```

---

## 📊 ĐÁNH GIÁ TỔNG THỂ

| Tiêu chí | Điểm | Ghi chú |
|----------|------|---------|
| **Cấu trúc cơ bản** | 8/10 | Tốt, đầy đủ các bảng chính |
| **Quan hệ dữ liệu** | 7/10 | Tốt nhưng thiếu Academic Year |
| **Performance** | 6/10 | Cần thêm indexes |
| **Data Integrity** | 7/10 | Cần thêm constraints |
| **Scalability** | 8/10 | Cấu trúc tốt cho scale |
| **Maintainability** | 8/10 | Code dễ maintain |

**TỔNG ĐIỂM: 7.3/10** - **TỐT, CẦN CẢI THIỆN**

---

## 🎯 KHUYẾN NGHỊ ƯU TIÊN

### **Priority 1 (Cần làm ngay):**
1. ✅ Thêm `AcademicYear` table
2. ✅ Thêm `Branch` table  
3. ✅ Thêm `Semester` table
4. ✅ Cải thiện `ContractUpload` cho student

### **Priority 2 (Làm sau):**
1. ✅ Thêm Status enums
2. ✅ Thêm Indexes
3. ✅ Thêm Constraints
4. ✅ Thêm Triggers

### **Priority 3 (Tối ưu):**
1. ✅ Partitioning cho large tables
2. ✅ Archiving cho old data
3. ✅ Monitoring và alerting

---

## 💡 KẾT LUẬN

Database schema hiện tại **ĐÃ SẴN SÀNG** để implement nghiệp vụ đăng ký khóa học với những cải thiện nhỏ. Cấu trúc cơ bản rất tốt, chỉ cần bổ sung một số bảng và constraints để hoàn thiện.

**Khuyến nghị:** Implement nghiệp vụ với schema hiện tại, sau đó từ từ cải thiện theo priority list ở trên.

