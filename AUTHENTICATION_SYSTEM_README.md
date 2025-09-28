# 🔐 Hệ Thống Authentication Đầy Đủ

## 📋 Tổng Quan

Hệ thống authentication được xây dựng với đầy đủ tính năng phân quyền, bảo mật cao và dễ sử dụng. Hỗ trợ 5 loại người dùng: **Center Owner**, **Teacher**, **Student**, **Parent**, và **Admin**.

## 🚀 Tính Năng Chính

### ✅ Backend (NestJS)
- **JWT Authentication** với Access Token & Refresh Token
- **Role-based Access Control** (RBAC)
- **Permission System** chi tiết
- **Session Management** với database
- **Auto Token Refresh**
- **Password Security** với bcrypt
- **Input Validation** với class-validator
- **Error Handling** toàn diện

### ✅ Frontend (React + TypeScript)
- **AuthContext** với React Context API
- **Auto Token Refresh** trong API calls
- **Route Protection** với middleware
- **Permission Components** (PermissionGate, RoleGate)
- **Profile Management** đầy đủ
- **Loading States** và Error Handling
- **Responsive UI** với Tailwind CSS

## 🏗️ Kiến Trúc Hệ Thống

```
📁 Authentication System
├── 🔧 Backend (NestJS)
│   ├── AuthModule
│   │   ├── AuthService (Business Logic)
│   │   ├── AuthController (API Endpoints)
│   │   └── DTOs (Data Transfer Objects)
│   ├── Guards & Decorators
│   │   ├── JwtAuthGuard
│   │   ├── RolesGuard
│   │   └── @Roles Decorator
│   └── Database
│       ├── User Model
│       ├── UserSession Model
│       └── Role-based Relations
│
└── 🎨 Frontend (React)
    ├── AuthContext
    │   ├── useAuth Hook
    │   ├── AuthProvider
    │   └── Auto Token Management
    ├── Components
    │   ├── PermissionGate
    │   ├── RoleGate
    │   └── AuthGuard
    ├── Pages
    │   ├── Login
    │   └── Profile
    └── Middleware
        ├── AuthMiddleware
        └── GuestMiddleware
```

## 🔑 Các Loại Người Dùng

| Role | Mô Tả | Quyền Hạn |
|------|-------|-----------|
| **Center Owner** | Chủ trung tâm | Toàn quyền quản lý trung tâm |
| **Teacher** | Giáo viên | Quản lý lớp học, điểm danh, chấm điểm |
| **Student** | Học sinh | Xem lịch học, điểm số, đăng ký lớp |
| **Parent** | Phụ huynh | Theo dõi con, xem báo cáo |
| **Admin** | Quản trị viên | Quản lý toàn hệ thống |

## 🛠️ Cài Đặt và Chạy

### 1. Backend Setup

```bash
cd server

# Cài đặt dependencies
npm install

# Cài đặt bcrypt cho seed data
npm install bcrypt

# Cấu hình environment variables
cp .env.example .env

# Cập nhật .env với các giá trị:
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-super-secret-jwt-key"
JWT_ACCESS_EXPIRE="1h"
JWT_REFRESH_EXPIRE="7d"

# Chạy migration
npx prisma migrate dev

# Seed dữ liệu mẫu
node prisma/seeder/seed-auth.js

# Chạy server
npm run start:dev
```

### 2. Frontend Setup

```bash
cd client

# Cài đặt dependencies
npm install

# Cài đặt thêm dependencies cần thiết
npm install sonner

# Cấu hình environment variables
cp .env.example .env.local

# Cập nhật .env.local:
VITE_SERVER_API_V1="http://localhost:9999"
VITE_SECRET_KEY_RES="your-encryption-key"

# Chạy development server
npm run dev
```

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Mô Tả | Auth Required |
|--------|----------|-------|---------------|
| `POST` | `/auth/login` | Đăng nhập | ❌ |
| `POST` | `/auth/logout` | Đăng xuất | ✅ |
| `POST` | `/auth/refresh` | Làm mới token | ❌ |
| `GET` | `/auth/profile` | Lấy thông tin profile | ✅ |
| `PATCH` | `/auth/profile` | Cập nhật profile | ✅ |
| `PATCH` | `/auth/change-password` | Đổi mật khẩu | ✅ |
| `GET` | `/auth/sessions` | Lấy danh sách session | ✅ |
| `DELETE` | `/auth/sessions/:id` | Hủy session | ✅ |

### Request/Response Examples

#### Login
```typescript
// Request
POST /auth/login
{
  "email": "owner@qne.edu.vn",
  "password": "123456"
}

// Response
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "owner@qne.edu.vn",
      "fullName": "Phan Ngọc Ánh",
      "role": "center_owner",
      "phone": "0123456789",
      "isActive": true,
      "teacher": null,
      "student": null,
      "parent": null
    }
  }
}
```

#### Profile
```typescript
// Request
GET /auth/profile
Authorization: Bearer <access_token>

// Response
{
  "success": true,
  "message": "Lấy thông tin profile thành công",
  "data": {
    "id": "uuid",
    "email": "owner@qne.edu.vn",
    "fullName": "Phan Ngọc Ánh",
    "role": "center_owner",
    "phone": "0123456789",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🎯 Cách Sử Dụng Frontend

### 1. AuthContext Hook

```typescript
import { useAuth } from '@/lib/auth'

function MyComponent() {
  const { user, login, logout, loading, error } = useAuth()

  const handleLogin = async () => {
    try {
      await login('owner@qne.edu.vn', '123456')
      // Redirect hoặc update UI
    } catch (error) {
      console.error('Login failed:', error.message)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!user) return <LoginForm />

  return (
    <div>
      <h1>Welcome, {user.fullName}!</h1>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### 2. Permission-based Components

```typescript
import { PermissionGate } from '@/components/Auth/PermissionGate'
import { RoleGate } from '@/components/Auth/RoleGate'

function AdminPanel() {
  return (
    <div>
      {/* Chỉ hiển thị cho Center Owner */}
      <RoleGate roles={['center_owner']}>
        <h2>Center Management</h2>
      </RoleGate>

      {/* Chỉ hiển thị cho Teacher */}
      <RoleGate roles={['teacher']}>
        <h2>Class Management</h2>
      </RoleGate>

      {/* Dựa trên permission */}
      <PermissionGate permission="students.create">
        <button>Create Student</button>
      </PermissionGate>

      <PermissionGate 
        permission="teachers.edit"
        fallback={<p>Bạn không có quyền chỉnh sửa giáo viên</p>}
      >
        <button>Edit Teacher</button>
      </PermissionGate>
    </div>
  )
}
```

### 3. Route Protection

```typescript
// routes/privateRoutes.tsx
import AuthMiddleware from '@/middlewares/AuthMiddleware'

export const privateRoutes = [
  {
    path: '/admin',
    element: <AuthMiddleware allowedRoles={['admin']} />,
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'users', element: <UserManagement /> }
    ]
  },
  {
    path: '/teacher',
    element: <AuthMiddleware allowedRoles={['teacher']} />,
    children: [
      { path: 'classes', element: <TeacherClasses /> },
      { path: 'schedule', element: <TeacherSchedule /> }
    ]
  },
  {
    path: '/profile',
    element: <AuthMiddleware />, // Tất cả user đã đăng nhập
    children: [
      { path: '', element: <ProfilePage /> }
    ]
  }
]
```

### 4. API Service Usage

```typescript
import { authService } from '@/services/common/auth/auth.service'

// Login
const loginData = await authService.login({
  email: 'owner@qne.edu.vn',
  password: '123456'
})

// Get Profile
const profile = await authService.getProfile()

// Update Profile
const updatedProfile = await authService.updateProfile({
  fullName: 'New Name',
  phone: '0987654321'
})

// Change Password
await authService.changePassword({
  oldPassword: 'old123',
  newPassword: 'new456'
})
```

## 🔒 Bảo Mật

### 1. Token Security
- **Access Token**: JWT với thời hạn 1 giờ
- **Refresh Token**: JWT với thời hạn 7 ngày
- **Auto Refresh**: Tự động làm mới token khi hết hạn
- **Token Storage**: Lưu trữ an toàn trong localStorage

### 2. Password Security
- **Hashing**: Sử dụng bcrypt với salt rounds
- **Validation**: Kiểm tra độ mạnh mật khẩu
- **Change Password**: Yêu cầu mật khẩu cũ

### 3. Session Management
- **Database Sessions**: Lưu trữ session trong database
- **Session Revocation**: Hủy session từ xa
- **Multiple Sessions**: Hỗ trợ đăng nhập nhiều thiết bị

### 4. Input Validation
- **DTOs**: Validation với class-validator
- **Sanitization**: Làm sạch input data
- **Type Safety**: TypeScript cho type checking

## 🧪 Testing

### 1. Test Accounts

| Email | Password | Role | Mô Tả |
|-------|----------|------|-------|
| `owner@qne.edu.vn` | `123456` | center_owner | Chủ trung tâm |
| `teacher@qne.edu.vn` | `123456` | teacher | Giáo viên |
| `student@qne.edu.vn` | `123456` | student | Học sinh |
| `parent@qne.edu.vn` | `123456` | parent | Phụ huynh |
| `admin@qne.edu.vn` | `123456` | admin | Quản trị viên |

### 2. Test Scenarios

```bash
# Test Login
curl -X POST http://localhost:9999/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@qne.edu.vn","password":"123456"}'

# Test Profile (với token)
curl -X GET http://localhost:9999/auth/profile \
  -H "Authorization: Bearer <access_token>"

# Test Refresh Token
curl -X POST http://localhost:9999/auth/refresh \
  -H "refresh-token: <refresh_token>"
```

## 🚨 Troubleshooting

### 1. Common Issues

**Token Expired Error**
```typescript
// Kiểm tra token trong localStorage
const token = localStorage.getItem('accessToken')
if (!token) {
  // Redirect to login
}
```

**Permission Denied**
```typescript
// Kiểm tra role và permission
const { user } = useAuth()
if (!user || !hasPermission(user.role, 'required.permission')) {
  // Show error hoặc redirect
}
```

**API Connection Error**
```typescript
// Kiểm tra environment variables
console.log(import.meta.env.VITE_SERVER_API_V1)
// Should be: http://localhost:9999
```

### 2. Debug Mode

```typescript
// Enable debug logging
localStorage.setItem('debug', 'true')

// Check auth state
console.log('Auth State:', { user, loading, error })
```

## 📈 Performance

### 1. Optimization
- **Token Caching**: Cache token trong memory
- **Lazy Loading**: Load components khi cần
- **Debounced API**: Giảm số lượng API calls
- **Error Boundaries**: Catch và handle errors

### 2. Monitoring
- **Session Tracking**: Theo dõi active sessions
- **Error Logging**: Log errors và exceptions
- **Performance Metrics**: Monitor response times

## 🔄 Migration Guide

### 1. From Mock to Real API

```typescript
// Before (Mock)
const mockUsers = [...]
const foundUser = mockUsers.find(u => u.email === email)

// After (Real API)
const response = await authService.login({ email, password })
const user = response.data.user
```

### 2. Update Environment Variables

```bash
# .env.local
VITE_SERVER_API_V1=http://localhost:9999
VITE_SECRET_KEY_RES=your-encryption-key
```

## 📝 Changelog

### v1.0.0 (Current)
- ✅ JWT Authentication với Access & Refresh Token
- ✅ Role-based Access Control (RBAC)
- ✅ Permission System
- ✅ Session Management
- ✅ Auto Token Refresh
- ✅ Profile Management
- ✅ Password Security
- ✅ Route Protection
- ✅ Error Handling
- ✅ TypeScript Support

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

---

## 🎉 Kết Luận

Hệ thống authentication này cung cấp một nền tảng vững chắc và bảo mật cho ứng dụng quản lý trung tâm giáo dục. Với kiến trúc modular và dễ mở rộng, bạn có thể dễ dàng thêm các tính năng mới hoặc tùy chỉnh theo nhu cầu cụ thể.

