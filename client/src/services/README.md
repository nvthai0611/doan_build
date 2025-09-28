    # Services Architecture

Cấu trúc services được tổ chức theo **role-based** để dễ quản lý và bảo mật.

## 📁 Cấu trúc thư mục

```
src/services/
├── common/                    # Services chung cho tất cả roles
│   ├── auth/                 # Authentication & Authorization
│   ├── api/                  # API Client & Utilities
│   ├── types/                # Shared Types
│   └── utils/                # Common Utilities
├── center-owner/             # Services cho Center Owner
│   ├── teacher-management/   # Quản lý giáo viên
│   ├── student-management/   # Quản lý học sinh
│   ├── center-dashboard/     # Dashboard tổng quan
│   └── center-schedule/      # Quản lý lịch học
├── teacher/                  # Services cho Teacher
│   ├── class-management/     # Quản lý lớp học
│   ├── schedule/             # Lịch dạy
│   └── profile/              # Profile cá nhân
├── student/                  # Services cho Student
│   ├── enrollment/           # Đăng ký lớp học
│   ├── schedule/             # Lịch học
│   └── profile/              # Profile cá nhân
├── parent/                   # Services cho Parent
│   ├── child-management/     # Quản lý con
│   └── communication/        # Giao tiếp với giáo viên
└── index.ts                  # Export tất cả services
```

## 🚀 Cách sử dụng

### Import Services

```typescript
// Import theo role
import { centerOwnerTeacherService } from '@/services/center-owner'
import { teacherClassService } from '@/services/teacher'
import { studentEnrollmentService } from '@/services/student'
import { parentChildService } from '@/services/parent'

// Import common services
import { authService, ApiService } from '@/services/common'

// Import tất cả (không khuyến khích)
import { centerOwnerTeacherService, teacherClassService } from '@/services'
```

### Ví dụ sử dụng

#### Center Owner - Quản lý giáo viên
```typescript
import { centerOwnerTeacherService } from '@/services/center-owner'

// Lấy danh sách giáo viên
const teachers = await centerOwnerTeacherService.getTeachers({
  page: 1,
  limit: 10,
  search: 'John'
})

// Tạo giáo viên mới
const newTeacher = await centerOwnerTeacherService.createTeacher({
  email: 'teacher@example.com',
  password: 'password123',
  fullName: 'John Doe',
  username: 'johndoe',
  role: 'teacher'
})
```

#### Teacher - Quản lý lớp học
```typescript
import { teacherClassService } from '@/services/teacher'

// Lấy danh sách lớp học
const classes = await teacherClassService.getClasses({
  status: 'active',
  page: 1,
  limit: 10
})

// Tạo buổi học mới
const session = await teacherClassService.createSession({
  classId: 'class-123',
  sessionDate: '2024-01-15',
  startTime: '09:00',
  endTime: '11:00'
})
```

#### Student - Đăng ký lớp học
```typescript
import { studentEnrollmentService } from '@/services/student'

// Lấy danh sách lớp đã đăng ký
const enrollments = await studentEnrollmentService.getEnrollments()

// Yêu cầu đăng ký lớp mới
await studentEnrollmentService.requestEnrollment({
  classId: 'class-123',
  message: 'Tôi muốn đăng ký lớp này'
})
```

#### Parent - Quản lý con
```typescript
import { parentChildService } from '@/services/parent'

// Lấy thông tin con
const children = await parentChildService.getChildren()

// Xem điểm danh của con
const attendance = await parentChildService.getChildAttendance('child-123', {
  startDate: '2024-01-01',
  endDate: '2024-01-31'
})
```

## 🔧 Common Services

### Authentication
```typescript
import { authService } from '@/services/common'

// Đăng nhập
const loginResult = await authService.login({
  email: 'user@example.com',
  password: 'password123'
})

// Lấy profile
const profile = await authService.getProfile()
```

### API Client
```typescript
import { ApiService } from '@/services/common'

// Generic API calls
const data = await ApiService.get('/api/endpoint', { param: 'value' })
const result = await ApiService.post('/api/endpoint', { data: 'value' })
```

## 📝 Best Practices

1. **Import theo role**: Chỉ import services cần thiết cho role hiện tại
2. **Type safety**: Luôn sử dụng types được export từ services
3. **Error handling**: Xử lý lỗi phù hợp cho từng API call
4. **Loading states**: Sử dụng loading states khi gọi API
5. **Caching**: Cache dữ liệu khi cần thiết để tối ưu performance

## 🔄 Migration từ cấu trúc cũ

Các services cũ vẫn được giữ lại trong `index.ts` để backward compatibility:

```typescript
// Cũ (vẫn hoạt động)
import { teacherService } from '@/services/teacherService'

// Mới (khuyến khích)
import { centerOwnerTeacherService } from '@/services/center-owner'
```

## 🎯 Lợi ích

- **Rõ ràng theo role**: Mỗi role có services riêng
- **Bảo mật tốt**: Dễ kiểm soát quyền truy cập
- **Dễ maintain**: Services được nhóm theo chức năng
- **Scalable**: Dễ thêm features mới cho từng role
- **Type safe**: Full TypeScript support
- **Consistent**: Cùng pattern cho tất cả services
