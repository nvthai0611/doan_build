# Hướng Dẫn Luồng Authentication - Frontend & Backend

## 📋 Tổng Quan
Tài liệu này mô tả chi tiết luồng authentication từ Frontend đến Backend và ngược lại.

## 🔄 Luồng Authentication Hoàn Chỉnh

### 1. **Đăng Nhập (Login Flow)**

#### Frontend (Client)
```
1. User nhập email/password → LoginForm.tsx
2. Gọi useAuth().login() → auth.tsx
3. Gọi authService.login() → auth.service.ts
4. Gửi POST request đến /auth/login → Backend
5. Nhận response từ Backend
6. Lưu tokens và user data vào localStorage
7. Set user state trong AuthProvider
8. Redirect dựa trên role → RoleBasedRedirect
```

#### Backend (Server)
```
1. Nhận POST /auth/login → auth.controller.ts
2. Validate email/password → auth.service.ts
3. Kiểm tra user trong database → Prisma
4. So sánh password với bcrypt
5. Tạo JWT access token và refresh token
6. Lưu session vào database (nếu cần)
7. Trả về response với tokens và user data
```

### 2. **Load Lại Trang (Page Reload Flow)**

#### Frontend (Client)
```
1. App khởi động → AuthProvider useEffect
2. Đọc user data từ localStorage
3. Kiểm tra access token có tồn tại
4. Parse user data từ JSON
5. Set user state
6. Verify token với Backend (optional)
7. Set loading = false
8. Render RoleBasedRedirect
9. Redirect dựa trên user.role
```

### 3. **Kiểm Tra Quyền Truy Cập (Authorization Flow)**

#### Frontend (Client)
```
1. User truy cập protected route
2. AuthMiddleware kiểm tra user state
3. AuthGuard kiểm tra role permissions
4. Nếu có quyền → Render component
5. Nếu không có quyền → Hiển thị "Không có quyền truy cập"
```

## 🗂️ Cấu Trúc File

### Frontend Files
```
client/src/
├── lib/
│   └── auth.tsx                 # AuthProvider, useAuth hook
├── services/
│   └── common/auth/
│       └── auth.service.ts      # API calls đến Backend
├── components/Auth/
│   ├── AuthGuard.tsx            # Kiểm tra quyền truy cập
│   ├── RoleGate.tsx             # Kiểm tra role
│   └── PermissionGate.tsx       # Kiểm tra permission
├── middlewares/
│   ├── AuthMiddleware.tsx       # Middleware cho protected routes
│   └── GuestMiddleware.tsx      # Middleware cho public routes
├── pages/Auth/
│   ├── Login.tsx                # Form đăng nhập
│   └── Profile.tsx              # Trang profile
├── routes/
│   ├── publicRoutes.tsx         # Routes công khai
│   └── privateRoutes.tsx        # Routes bảo mật
└── layouts/
    ├── DefaultLayout.tsx        # Layout mặc định
    └── DynamicLayout.tsx        # Layout động theo role
```

### Backend Files
```
server/src/
├── modules/auth/
│   ├── auth.controller.ts       # API endpoints
│   ├── auth.service.ts          # Business logic
│   ├── auth.module.ts           # Module configuration
│   └── dto/
│       ├── loginDto.ts          # Login request DTO
│       ├── change-password.dto.ts
│       └── update-profile.dto.ts
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts    # JWT authentication guard
│   │   └── roles.guard.ts       # Role-based authorization guard
│   └── decorators/
│       └── current-user.decorator.ts
├── utils/
│   ├── jwt.util.ts              # JWT token utilities
│   ├── hasing.util.ts           # Password hashing
│   └── redis.util.ts            # Redis session management
└── db/
    └── prisma.service.ts        # Database connection
```

## 🔐 Các Role và Quyền Truy Cập

### Roles
```typescript
type UserRole = "center_owner" | "teacher" | "admin" | "student" | "parent"
```

### Route Permissions
```
/center-qn/*     → center_owner only
/teacher/*       → teacher only  
/student/*       → student only
/parent/*        → parent only
/admin/*         → admin only
/profile         → all authenticated users
```

## 🚀 Luồng Chi Tiết

### A. Đăng Nhập Thành Công

1. **User nhập thông tin** trong `LoginForm.tsx`
2. **Gọi API** `authService.login({ email, password })`
3. **Backend xử lý**:
   - Validate input
   - Tìm user trong database
   - So sánh password với bcrypt
   - Tạo JWT tokens
   - Trả về user data + tokens
4. **Frontend nhận response**:
   - Lưu tokens vào localStorage
   - Lưu user data vào localStorage
   - Set user state trong AuthProvider
5. **Redirect** dựa trên role:
   - center_owner → /center-qn
   - teacher → /teacher/profile
   - student → /student
   - parent → /parent
   - admin → /admin

### B. Load Lại Trang

1. **App khởi động** → `AuthProvider` useEffect
2. **Đọc localStorage**:
   - user data
   - access token
   - refresh token
3. **Parse user data** từ JSON
4. **Set user state** trong AuthProvider
5. **Verify token** (optional) với Backend
6. **Set loading = false**
7. **Render RoleBasedRedirect**:
   - Kiểm tra user.role
   - Redirect đến đúng route

### C. Truy Cập Protected Route

1. **User truy cập** route như `/teacher/profile`
2. **AuthMiddleware** kiểm tra:
   - User đã đăng nhập chưa?
   - Role có phù hợp không?
3. **AuthGuard** kiểm tra:
   - requireAuth = true
   - allowedRoles = ['teacher']
4. **Nếu có quyền** → Render component
5. **Nếu không có quyền** → Hiển thị lỗi

## 🐛 Debug và Troubleshooting

### Console Logs Quan Trọng
```javascript
// Khi đăng nhập
"Login: User role: teacher"
"Login: User data stored: {id, email, role, ...}"

// Khi load lại trang
"AuthProvider: User role: teacher"
"RoleBasedRedirect: User role: teacher"
"RoleBasedRedirect: Redirecting to /teacher/profile"

// Khi kiểm tra quyền
"User role: teacher"
"Allowed roles: ['teacher']"
"Has required role: true"
```

### Các Lỗi Thường Gặp

1. **"Không có quyền truy cập"**
   - Kiểm tra user.role có đúng không
   - Kiểm tra allowedRoles trong route
   - Kiểm tra AuthGuard logic

2. **Redirect sai route**
   - Kiểm tra RoleBasedRedirect logic
   - Kiểm tra user.role value
   - Kiểm tra switch case trong redirect

3. **Sidebar sai**
   - Kiểm tra DynamicLayout logic
   - Kiểm tra SidebarCenterQn role detection
   - Kiểm tra menuItems selection

## 🔧 Cách Sửa Lỗi

### 1. Kiểm Tra User Data
```javascript
// Trong console
console.log(localStorage.getItem('user'))
console.log(JSON.parse(localStorage.getItem('user')))
```

### 2. Kiểm Tra Role
```javascript
// Trong AuthGuard
console.log('User role:', user.role)
console.log('Allowed roles:', allowedRoles)
console.log('Has required role:', hasRequiredRole)
```

### 3. Kiểm Tra Redirect
```javascript
// Trong RoleBasedRedirect
console.log('User role:', user.role)
console.log('Redirecting to:', redirectPath)
```

## 📝 Ghi Chú Quan Trọng

1. **localStorage** lưu trữ user data và tokens
2. **AuthProvider** quản lý state toàn cục
3. **AuthGuard** kiểm tra quyền truy cập
4. **DynamicLayout** hiển thị layout theo role
5. **RoleBasedRedirect** redirect theo role

## 🎯 Kết Luận

Luồng authentication hoạt động theo thứ tự:
1. Login → Lưu data → Redirect
2. Reload → Load data → Redirect  
3. Access route → Check permission → Render

Mọi vấn đề đều có thể debug thông qua console logs và kiểm tra localStorage.
