# 🏗️ Kiến trúc Frontend-Backend Communication

## 📋 Mục lục
1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Các khái niệm cơ bản](#các-khái-niệm-cơ-bản)
3. [Quy trình giao tiếp Frontend-Backend](#quy-trình-giao-tiếp-frontend-backend)
4. [Phân tích code TeacherManagement.tsx](#phân-tích-code-teachermanagementtsx)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Tổng quan kiến trúc

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│   Frontend      │ ◄──────────────► │   Backend       │
│   (React)       │                  │   (NestJS)      │
└─────────────────┘                  └─────────────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                  ┌─────────────────┐
│   UI Components │                  │   API Endpoints │
│   - TeacherMgmt │                  │   - /teachers   │
│   - Forms       │                  │   - /auth       │
│   - Tables      │                  │   - /upload     │
└─────────────────┘                  └─────────────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                  ┌─────────────────┐
│   State Mgmt    │                  │   Database      │
│   - React Query │                  │   - PostgreSQL  │
│   - Local State │                  │   - Prisma ORM  │
└─────────────────┘                  └─────────────────┘
```

---

## 🔧 Các khái niệm cơ bản

### 1. **Entity (Thực thể)**
```typescript
// Backend: server/src/modules/teacher/entities/teacher.entity.ts
export class Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'teacher' | 'admin' | 'center_owner';
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Tại sao cần Entity?**
- ✅ **Đại diện cho bảng database**: Mỗi Entity = 1 bảng trong DB
- ✅ **Validation tự động**: NestJS tự validate dữ liệu
- ✅ **Type Safety**: TypeScript biết chính xác cấu trúc dữ liệu
- ✅ **ORM Mapping**: Prisma/TypeORM map Entity với database

### 2. **DTO (Data Transfer Object)**
```typescript
// Backend: server/src/modules/teacher/dto/create-teacher.dto.ts
export class CreateTeacherDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(['teacher', 'admin', 'center_owner'])
  role: string;
}
```

**Tại sao cần DTO?**
- ✅ **Validation**: Kiểm tra dữ liệu đầu vào trước khi xử lý
- ✅ **Security**: Chỉ cho phép các field cần thiết
- ✅ **Documentation**: API docs tự động sinh từ DTO
- ✅ **Type Safety**: Đảm bảo dữ liệu đúng format

### 3. **Interface (Giao diện)**
```typescript
// Frontend: client/src/pages/manager/Teacher-management/types/teacher.ts
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  code: string;
  role: "Giáo viên" | "Giáo vụ" | "Chủ trung tâm";
  gender: "Nam" | "Nữ" | "Khác";
  status: boolean;
  verifiedPhone?: string;
  verifiedEmail?: string;
  loginUsername?: string;
  accountStatus?: boolean;
  notes?: string;
}
```

**Tại sao cần Interface?**
- ✅ **Type Safety**: TypeScript biết cấu trúc dữ liệu
- ✅ **IntelliSense**: IDE gợi ý properties và methods
- ✅ **Refactoring**: Dễ dàng thay đổi cấu trúc
- ✅ **Documentation**: Code tự document

### 4. **API Response**
```typescript
// Backend: server/src/common/interfaces/api-response.interface.ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  status: number;
}
```

**Tại sao cần API Response?**
- ✅ **Consistency**: Tất cả API đều có format giống nhau
- ✅ **Error Handling**: Dễ xử lý lỗi
- ✅ **Pagination**: Hỗ trợ phân trang
- ✅ **Status Codes**: HTTP status codes chuẩn

---

## 🔄 Quy trình giao tiếp Frontend-Backend

### Bước 1: Frontend gửi request
```typescript
// TeacherManagement.tsx
const { data: teachersData, isLoading, error } = useQuery({
  queryKey: ['teachers', searchTerm, selectedRole, activeTab, currentPage, itemsPerPage],
  queryFn: async () => {
    const result = await teacherService.getTeachers({
      search: searchTerm || undefined,
      role: selectedRole !== "Nhóm quyền" ? roleMap[selectedRole] : undefined,
      status: statusMap[activeTab],
      page: currentPage,
      limit: itemsPerPage,
      sortBy: "createdAt",
      sortOrder: "desc"
    })
    return result
  }
})
```

### Bước 2: Service layer xử lý
```typescript
// teacherService.ts
export const teacherService = {
  getTeachers: async (params?: QueryTeacherParams): Promise<ApiResponse<TeacherResponse>> => {
    const response = await apiClient.get<TeacherResponse>('/admin-center/teacher-management', params);
    return response; 
  }
}
```

### Bước 3: HTTP Client gửi request
```typescript
// clientAxios.ts
export const apiClient = {
  get: async <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
    const response = await axios.get(url, { params });
    return response.data;
  }
}
```

### Bước 4: Backend nhận request
```typescript
// teacher-management.controller.ts
@Controller('admin-center/teacher-management')
export class TeacherManagementController {
  @Get()
  async getTeachers(@Query() query: QueryTeacherDto) {
    const result = await this.teacherService.findAll(query);
    return {
      success: true,
      message: 'Teachers retrieved successfully',
      data: result.data,
      meta: result.meta
    };
  }
}
```

### Bước 5: Service xử lý business logic
```typescript
// teacher-management.service.ts
async findAll(query: QueryTeacherDto) {
  const { page, limit, search, role, status } = query;
  
  const where = {
    ...(search && { name: { contains: search } }),
    ...(role && { role }),
    ...(status !== 'all' && { status: status === 'active' })
  };

  const [teachers, total] = await Promise.all([
    this.prisma.teacher.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    this.prisma.teacher.count({ where })
  ]);

  return {
    data: teachers,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

### Bước 6: Database trả về dữ liệu
```sql
-- Prisma ORM tự động generate SQL
SELECT * FROM teachers 
WHERE name LIKE '%search%' 
  AND role = 'teacher' 
  AND status = true
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;
```

### Bước 7: Backend trả response
```json
{
  "success": true,
  "message": "Teachers retrieved successfully",
  "data": [
    {
      "id": "1",
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "phone": "0123456789",
      "role": "teacher",
      "status": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "status": 200
}
```

### Bước 8: Frontend nhận và xử lý
```typescript
// TeacherManagement.tsx
const employeeData = (teachersData as any)?.data || []
const totalCount = (teachersData as any)?.meta?.total || 0

// Render UI
{paginatedEmployees.map((employee: Employee, index: number) => (
  <tr key={employee.id}>
    <td>{employee.name}</td>
    <td>{employee.email}</td>
    <td>{employee.phone}</td>
    <td>{employee.role}</td>
  </tr>
))}
```

---

## 📊 Phân tích code TeacherManagement.tsx

### 1. **State Management với React Query**
```typescript
const { data: teachersData, isLoading, error } = useQuery({
  queryKey: ['teachers', searchTerm, selectedRole, activeTab, currentPage, itemsPerPage],
  queryFn: async () => {
    // Gọi API
  },
  staleTime: 5 * 60 * 1000, // Cache 5 phút
  gcTime: 10 * 60 * 1000,   // Garbage collect sau 10 phút
})
```

**Tại sao dùng React Query?**
- ✅ **Caching**: Tự động cache dữ liệu
- ✅ **Background refetch**: Tự động cập nhật dữ liệu
- ✅ **Loading states**: Quản lý trạng thái loading
- ✅ **Error handling**: Xử lý lỗi tự động

### 2. **Mutation cho thao tác CUD**
```typescript
const toggleStatusMutation = useMutation({
  mutationFn: (employeeId: string) => teacherService.toggleTeacherStatus(employeeId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['teachers'] })
    console.log("Teacher status toggled successfully")
  },
  onError: (error) => {
    console.error("Error toggling teacher status:", error)
    alert("Có lỗi xảy ra khi cập nhật trạng thái giáo viên")
  }
})
```

**Tại sao dùng Mutation?**
- ✅ **Optimistic updates**: Cập nhật UI trước khi API trả về
- ✅ **Error handling**: Xử lý lỗi chi tiết
- ✅ **Success callbacks**: Thực hiện action sau khi thành công
- ✅ **Cache invalidation**: Tự động cập nhật cache

### 3. **Type Safety với Interface**
```typescript
interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  code: string;
  role: "Giáo viên" | "Giáo vụ" | "Chủ trung tâm";
  gender: "Nam" | "Nữ" | "Khác";
  status: boolean;
  // ... other fields
}
```

**Lợi ích:**
- ✅ **IntelliSense**: IDE gợi ý properties
- ✅ **Compile-time errors**: Phát hiện lỗi khi build
- ✅ **Refactoring**: Dễ dàng thay đổi cấu trúc
- ✅ **Documentation**: Code tự document

### 4. **Error Handling**
```typescript
{loading ? (
  <tr>
    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
      <div className="flex items-center justify-center">
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
        Đang tải dữ liệu...
      </div>
    </td>
  </tr>
) : error ? (
  <tr>
    <td colSpan={6} className="px-6 py-8 text-center text-red-500">
      <div className="flex flex-col items-center justify-center">
        <p>Có lỗi xảy ra khi tải dữ liệu</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Thử lại
        </Button>
      </div>
    </td>
  </tr>
) : (
  // Render data
)}
```

---

## 🎯 Best Practices

### 1. **API Design**
```typescript
// ✅ Good: Consistent response format
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

// ❌ Bad: Inconsistent response format
// Sometimes returns data directly, sometimes wrapped
```

### 2. **Error Handling**
```typescript
// ✅ Good: Comprehensive error handling
try {
  const result = await teacherService.getTeachers(params);
  return result;
} catch (error) {
  console.error("Error fetching teachers:", error);
  throw new Error("Failed to fetch teachers");
}

// ❌ Bad: No error handling
const result = await teacherService.getTeachers(params);
return result;
```

### 3. **Type Safety**
```typescript
// ✅ Good: Strong typing
const handleEmployeeStatusToggle = (employeeId: string): void => {
  toggleStatusMutation.mutate(employeeId);
};

// ❌ Bad: Any type
const handleEmployeeStatusToggle = (employeeId: any) => {
  toggleStatusMutation.mutate(employeeId);
};
```

### 4. **Caching Strategy**
```typescript
// ✅ Good: Proper cache keys
queryKey: ['teachers', searchTerm, selectedRole, activeTab, currentPage, itemsPerPage]

// ❌ Bad: Generic cache key
queryKey: ['teachers']
```

---

## 🐛 Troubleshooting

### 1. **API không trả về dữ liệu**
```typescript
// Check network tab in browser dev tools
// Verify API endpoint URL
// Check request parameters
console.log("API Request:", { searchTerm, selectedRole, activeTab });
```

### 2. **Type errors**
```typescript
// Check interface definitions
// Verify data structure from API
// Use type assertions carefully
const employeeData = (teachersData as any)?.data || []
```

### 3. **Cache issues**
```typescript
// Invalidate specific queries
queryClient.invalidateQueries({ queryKey: ['teachers'] });

// Or refetch specific query
refetch();
```

### 4. **Performance issues**
```typescript
// Use pagination
// Implement debouncing for search
// Optimize re-renders with useMemo
const debouncedSearchTerm = useMemo(() => {
  const timer = setTimeout(() => searchTerm, 500);
  return () => clearTimeout(timer);
}, [searchTerm]);
```

---

## 📚 Tóm tắt

### **Tại sao cần tất cả những thứ này?**

1. **Entity**: Đại diện cho database, đảm bảo dữ liệu đúng cấu trúc
2. **DTO**: Validation và security, chỉ cho phép dữ liệu hợp lệ
3. **Interface**: Type safety cho Frontend, tránh lỗi runtime
4. **API Response**: Consistency, dễ xử lý và maintain
5. **React Query**: Caching, loading states, error handling tự động
6. **Service Layer**: Tách biệt logic API với UI components

### **Lợi ích của kiến trúc này:**
- ✅ **Maintainable**: Dễ bảo trì và mở rộng
- ✅ **Scalable**: Có thể scale theo nhu cầu
- ✅ **Type Safe**: Ít lỗi runtime
- ✅ **Testable**: Dễ viết unit tests
- ✅ **User Experience**: Loading states và error handling tốt

---

## 🚀 Next Steps

1. **Học thêm về React Query**: Caching strategies, mutations
2. **Tìm hiểu NestJS**: Decorators, guards, interceptors
3. **Database design**: Relationships, indexes, migrations
4. **Testing**: Unit tests, integration tests
5. **Performance**: Bundle splitting, lazy loading, optimization

---

*Tài liệu này được tạo dựa trên code TeacherManagement.tsx và kiến trúc của dự án.*
