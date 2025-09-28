# Hướng dẫn sử dụng Constants - Server

File này chứa các ví dụ về cách sử dụng constants trong server (NestJS).

## 1. Import Constants

```typescript
import {
  StudentStatus,
  ClassStatus,
  SessionStatus,
  AttendanceStatus,
  Gender,
  STUDENT_STATUS_LABELS,
  validateStatus,
  getStatusLabel,
  mapVietnameseStatusToEnum,
  DEFAULT_STATUS
} from '../common/constants'
```

## 2. Sử dụng trong DTOs

### 2.1. Validation DTO

```typescript
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { StudentStatus, ClassStatus } from '../common/constants'

export class CreateStudentDto {
  @IsString()
  name: string

  @IsString()
  email: string

  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus = DEFAULT_STATUS.STUDENT

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender
}

export class UpdateStudentStatusDto {
  @IsEnum(StudentStatus)
  status: StudentStatus
}
```

### 2.2. Query DTO

```typescript
import { IsOptional, IsEnum, IsString } from 'class-validator'
import { StudentStatus, ClassStatus } from '../common/constants'

export class StudentQueryDto {
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus = StudentStatus.ALL

  @IsOptional()
  @IsString()
  search?: string
}

export class ClassQueryDto {
  @IsOptional()
  @IsEnum(ClassStatus)
  status?: ClassStatus = ClassStatus.ALL

  @IsOptional()
  @IsString()
  search?: string
}
```

## 3. Sử dụng trong Services

### 3.1. Student Service

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../db/prisma.service'
import { StudentStatus, mapVietnameseStatusToEnum, validateStatus } from '../common/constants'

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async getStudents(status?: StudentStatus) {
    const where: any = {}
    
    if (status && status !== StudentStatus.ALL) {
      // Validate status trước khi sử dụng
      validateStatus(status, StudentStatus, 'status')
      where.status = status
    }

    return this.prisma.student.findMany({
      where,
      include: {
        user: true,
        school: true
      }
    })
  }

  async updateStudentStatus(studentId: string, status: StudentStatus) {
    // Validate status
    validateStatus(status, StudentStatus, 'status')
    
    return this.prisma.student.update({
      where: { id: studentId },
      data: { status }
    })
  }

  async getStudentStatusCounts() {
    const counts = await this.prisma.student.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    // Map counts to enum values
    const result = {
      [StudentStatus.ALL]: 0,
      [StudentStatus.PENDING]: 0,
      [StudentStatus.UPCOMING]: 0,
      [StudentStatus.STUDYING]: 0,
      [StudentStatus.RESERVED]: 0,
      [StudentStatus.STOPPED]: 0,
      [StudentStatus.GRADUATED]: 0,
    }

    counts.forEach(item => {
      const status = mapVietnameseStatusToEnum(item.status)
      result[status] = item._count.status
      result[StudentStatus.ALL] += item._count.status
    })

    return result
  }
}
```

### 3.2. Class Service

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../db/prisma.service'
import { ClassStatus, validateStatus } from '../common/constants'

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}

  async getClasses(status?: ClassStatus) {
    const where: any = {}
    
    if (status && status !== ClassStatus.ALL) {
      validateStatus(status, ClassStatus, 'status')
      where.status = status
    }

    return this.prisma.class.findMany({
      where,
      include: {
        subject: true,
        teacher: {
          include: {
            user: true
          }
        }
      }
    })
  }

  async updateClassStatus(classId: string, status: ClassStatus) {
    validateStatus(status, ClassStatus, 'status')
    
    return this.prisma.class.update({
      where: { id: classId },
      data: { status }
    })
  }
}
```

## 4. Sử dụng trong Controllers

### 4.1. Student Controller

```typescript
import { Controller, Get, Post, Put, Query, Body, Param } from '@nestjs/common'
import { ApiTags, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { StudentService } from './student.service'
import { StudentStatus, ClassStatus } from '../common/constants'

@ApiTags('students')
@Controller('students')
export class StudentController {
  constructor(private studentService: StudentService) {}

  @Get()
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: StudentStatus,
    description: 'Trạng thái học sinh'
  })
  @ApiResponse({ status: 200, description: 'Danh sách học sinh' })
  async getStudents(@Query('status') status?: StudentStatus) {
    return this.studentService.getStudents(status)
  }

  @Put(':id/status')
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  async updateStudentStatus(
    @Param('id') id: string,
    @Body('status') status: StudentStatus
  ) {
    return this.studentService.updateStudentStatus(id, status)
  }
}
```

### 4.2. Class Controller

```typescript
import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiQuery } from '@nestjs/swagger'
import { ClassService } from './class.service'
import { ClassStatus } from '../common/constants'

@ApiTags('classes')
@Controller('classes')
export class ClassController {
  constructor(private classService: ClassService) {}

  @Get()
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: ClassStatus,
    description: 'Trạng thái lớp học'
  })
  async getClasses(@Query('status') status?: ClassStatus) {
    return this.classService.getClasses(status)
  }
}
```

## 5. Sử dụng trong Guards và Interceptors

### 5.1. Status Validation Guard

```typescript
import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common'
import { StudentStatus, validateStatus } from '../common/constants'

@Injectable()
export class StudentStatusGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const status = request.body?.status || request.query?.status

    if (status) {
      try {
        validateStatus(status, StudentStatus, 'status')
        return true
      } catch (error) {
        throw new BadRequestException(error.message)
      }
    }

    return true
  }
}
```

## 6. Sử dụng trong Transformers

### 6.1. Status Transformer

```typescript
import { Transform } from 'class-transformer'
import { StudentStatus, mapVietnameseStatusToEnum } from '../common/constants'

export class StudentResponseDto {
  id: string
  name: string
  
  @Transform(({ value }) => mapVietnameseStatusToEnum(value))
  status: StudentStatus
  
  @Transform(({ value }) => getStatusLabel(value, STUDENT_STATUS_LABELS))
  statusLabel: string
}
```

## 7. Sử dụng trong Exception Filters

### 7.1. Custom Exception

```typescript
import { HttpException, HttpStatus } from '@nestjs/common'
import { StudentStatus, getStatusValues } from '../common/constants'

export class InvalidStatusException extends HttpException {
  constructor(status: string) {
    const validStatuses = getStatusValues(StudentStatus)
    super(
      `Trạng thái '${status}' không hợp lệ. Các trạng thái hợp lệ: ${validStatuses.join(', ')}`,
      HttpStatus.BAD_REQUEST
    )
  }
}
```

## 8. Sử dụng trong Tests

### 8.1. Unit Tests

```typescript
import { Test, TestingModule } from '@nestjs/testing'
import { StudentService } from './student.service'
import { StudentStatus } from '../common/constants'

describe('StudentService', () => {
  let service: StudentService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentService],
    }).compile()

    service = module.get<StudentService>(StudentService)
  })

  it('should filter students by status', async () => {
    const students = await service.getStudents(StudentStatus.STUDYING)
    expect(students.every(s => s.status === StudentStatus.STUDYING)).toBe(true)
  })

  it('should throw error for invalid status', async () => {
    await expect(service.updateStudentStatus('id', 'invalid' as StudentStatus))
      .rejects.toThrow()
  })
})
```

## 9. Sử dụng trong Database Migrations

### 9.1. Seed Data

```typescript
import { PrismaClient } from '@prisma/client'
import { StudentStatus, ClassStatus, Gender } from '../common/constants'

const prisma = new PrismaClient()

async function seedData() {
  // Create students with proper status
  await prisma.student.createMany({
    data: [
      {
        userId: 'user1',
        schoolId: 'school1',
        status: StudentStatus.STUDYING
      },
      {
        userId: 'user2',
        schoolId: 'school1',
        status: StudentStatus.PENDING
      }
    ]
  })

  // Create classes with proper status
  await prisma.class.createMany({
    data: [
      {
        name: 'Lớp Toán 10A',
        status: ClassStatus.ACTIVE,
        subjectId: 'subject1',
        teacherId: 'teacher1'
      }
    ]
  })
}
```

## 10. Best Practices

### 10.1. Luôn validate input

```typescript
// ✅ Luôn validate
@Post()
async createStudent(@Body() createStudentDto: CreateStudentDto) {
  validateStatus(createStudentDto.status, StudentStatus, 'status')
  return this.studentService.create(createStudentDto)
}
```

### 10.2. Sử dụng constants trong API documentation

```typescript
@ApiQuery({ 
  name: 'status', 
  enum: StudentStatus,  // Sử dụng enum thay vì hardcode
  description: 'Trạng thái học sinh'
})
```

### 10.3. Error handling với constants

```typescript
try {
  validateStatus(status, StudentStatus, 'status')
} catch (error) {
  throw new BadRequestException({
    message: 'Trạng thái không hợp lệ',
    validStatuses: getStatusValues(StudentStatus),
    providedStatus: status
  })
}
```

## 11. Migration từ code cũ

### 11.1. Thay thế hardcoded strings

```typescript
// Trước
if (status === 'studying') {
  // ...
}

// Sau
if (status === StudentStatus.STUDYING) {
  // ...
}
```

### 11.2. Cập nhật DTOs

```typescript
// Trước
@IsIn(['studying', 'pending', 'graduated'])
status: string

// Sau
@IsEnum(StudentStatus)
status: StudentStatus
```

## 12. Lưu ý quan trọng

1. **Luôn import constants** từ file tập trung
2. **Validate status** trong DTOs và services
3. **Sử dụng enums** trong API documentation
4. **Handle errors** với thông báo rõ ràng
5. **Test kỹ** khi thay đổi constants
6. **Cập nhật database** khi thay đổi enum values
