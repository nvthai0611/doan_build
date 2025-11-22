# Hướng dẫn sử dụng Audit Log

## Tổng quan

Audit Log được tạo tự động trong các trường hợp sau:

1. **Tự động qua Interceptor**: Một số request POST/PATCH/DELETE sẽ được log tự động
2. **Thủ công trong Service**: Gọi method `createAuditLog()` hoặc `logCrudOperation()` trong các service

## Khi nào Audit Log được tạo?

### 1. Tự động (qua Interceptor)

Interceptor sẽ tự động tạo audit log cho:
- **POST** requests → action: `create`
- **PATCH/PUT** requests → action: `update`  
- **DELETE** requests → action: `delete`

**Điều kiện:**
- Request phải có user authenticated (có `req.user.userId`)
- URL phải match với các route đã được map (xem `audit-log.interceptor.ts`)

**Ví dụ routes được log tự động:**
- `/admin-center/user-management` → table: `users`
- `/admin-center/classes` → table: `classes`
- `/admin-center/students` → table: `students`
- Và nhiều routes khác...

### 2. Thủ công trong Service

#### Cách 1: Sử dụng `logCrudOperation()` (Đơn giản)

```typescript
import { AuditLogService } from 'src/modules/admin-center/services/audit-log.service';

@Injectable()
export class YourService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService, // Inject service
  ) {}

  async createUser(data: CreateUserDto, userId: string, req: any) {
    // Tạo user
    const newUser = await this.prisma.user.create({ data });

    // Log audit
    await this.auditLogService.logCrudOperation(
      userId,                    // ID người thực hiện
      'create',                  // Action
      'users',                   // Table name
      newUser.id,                // Record ID
      undefined,                 // Old values (không có cho create)
      newUser,                   // New values
      req.ip,                    // IP address
      req.headers['user-agent'], // User agent
    );

    return newUser;
  }

  async updateUser(id: string, data: UpdateUserDto, userId: string, req: any) {
    // Lấy giá trị cũ
    const oldUser = await this.prisma.user.findUnique({ where: { id } });

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    // Log audit
    await this.auditLogService.logCrudOperation(
      userId,
      'update',
      'users',
      id,
      oldUser,      // Old values
      updatedUser,  // New values
      req.ip,
      req.headers['user-agent'],
    );

    return updatedUser;
  }

  async deleteUser(id: string, userId: string, req: any) {
    // Lấy giá trị cũ trước khi xóa
    const oldUser = await this.prisma.user.findUnique({ where: { id } });

    // Delete user
    await this.prisma.user.delete({ where: { id } });

    // Log audit
    await this.auditLogService.logCrudOperation(
      userId,
      'delete',
      'users',
      id,
      oldUser,      // Old values
      null,         // New values (null cho delete)
      req.ip,
      req.headers['user-agent'],
    );
  }
}
```

#### Cách 2: Sử dụng `createAuditLog()` (Linh hoạt hơn)

```typescript
await this.auditLogService.createAuditLog({
  userId: 'user-id',
  action: 'create', // hoặc 'update', 'delete', 'login', 'logout'
  tableName: 'users',
  recordId: 'record-id',
  oldValues: { /* giá trị cũ */ },
  newValues: { /* giá trị mới */ },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

### 3. Log Login/Logout

Để log login/logout, thêm vào `auth.service.ts`:

```typescript
import { AuditLogService } from 'src/modules/admin-center/services/audit-log.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService, // Thêm vào constructor
  ) {}

  async login(identifier: string, password: string, req?: any) {
    const user = await this.validateUser(identifier, password);
    
    // ... logic login hiện tại ...

    // Log audit
    await this.auditLogService.createAuditLog({
      userId: user.id,
      action: 'login',
      tableName: 'users',
      recordId: user.id,
      newValues: { loginTime: new Date() },
      ipAddress: req?.ip || null,
      userAgent: req?.headers?.['user-agent'] || null,
    });

    return { accessToken, refreshToken, user };
  }

  async logout(userId: string, req?: any) {
    // ... logic logout hiện tại ...

    // Log audit
    await this.auditLogService.createAuditLog({
      userId,
      action: 'logout',
      tableName: 'users',
      recordId: userId,
      ipAddress: req?.ip || null,
      userAgent: req?.headers?.['user-agent'] || null,
    });

    return result;
  }
}
```

Và cập nhật controller để truyền `req`:

```typescript
@Post('login')
async login(@Body() loginDto: LoginDto, @Req() req: any) {
  const result = await this.authService.login(
    loginDto.identifier, 
    loginDto.password,
    req // Truyền request để lấy IP và User Agent
  );
  return result;
}

@Post('logout')
@UseGuards(JwtAuthGuard)
async logout(@Req() req: any) {
  const userId = req.user.userId;
  const result = await this.authService.logout(userId, req);
  return result;
}
```

## Các Action Types

- `create`: Tạo mới bản ghi
- `update`: Cập nhật bản ghi
- `delete`: Xóa bản ghi
- `login`: Đăng nhập
- `logout`: Đăng xuất
- Custom: Bạn có thể tạo action tùy chỉnh (VD: `approve`, `reject`, `export`)

## Lưu ý

1. **Không throw error**: Method `createAuditLog()` không throw error để không ảnh hưởng đến flow chính
2. **Async không blocking**: Audit log được tạo bất đồng bộ, không làm chậm response
3. **IP Address**: Có thể lấy từ `req.ip` hoặc `req.headers['x-forwarded-for']` (khi có proxy)
4. **User Agent**: Lấy từ `req.headers['user-agent']`

## Ví dụ thực tế

Xem các service sau để tham khảo:
- `user-management.service.ts` - Có thể thêm audit log cho create/update/delete user
- `class-management.service.ts` - Có thể thêm audit log cho các thao tác với lớp học
- `auth.service.ts` - Thêm audit log cho login/logout

