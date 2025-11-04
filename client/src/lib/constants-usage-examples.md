# Hướng dẫn sử dụng Constants

File này chứa các ví dụ về cách sử dụng constants trong dự án.

## 1. Import Constants

```typescript
import {
  StudentStatus,
  ClassStatus,
  SessionStatus,
  AttendanceStatus,
  Gender,
  STUDENT_STATUS_LABELS,
  STUDENT_STATUS_COLORS,
  getStatusLabel,
  getStatusColor,
  mapVietnameseStatusToEnum,
  createSelectOptions
} from '@/lib/constants'
```

## 2. Sử dụng trong Components

### 2.1. Student Management Component

```typescript
import React from 'react'
import { StudentStatus, STUDENT_STATUS_LABELS, STUDENT_STATUS_COLORS } from '@/lib/constants'

interface Student {
  id: string
  name: string
  status: StudentStatus
}

const StudentCard: React.FC<{ student: Student }> = ({ student }) => {
  return (
    <div className={`p-4 rounded-lg border ${getStatusColor(student.status, STUDENT_STATUS_COLORS)}`}>
      <h3>{student.name}</h3>
      <span className="text-sm">
        {getStatusLabel(student.status, STUDENT_STATUS_LABELS)}
      </span>
    </div>
  )
}
```

### 2.2. Status Filter Component

```typescript
import React from 'react'
import { StudentStatus, createSelectOptions, STUDENT_STATUS_LABELS } from '@/lib/constants'

const StatusFilter: React.FC<{ onStatusChange: (status: StudentStatus) => void }> = ({ onStatusChange }) => {
  const statusOptions = createSelectOptions(StudentStatus, STUDENT_STATUS_LABELS, true)
  
  return (
    <select onChange={(e) => onStatusChange(e.target.value as StudentStatus)}>
      {statusOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
```

### 2.3. Status Tabs Component

```typescript
import React from 'react'
import { StudentStatus, STUDENT_STATUS_LABELS, STUDENT_STATUS_COLORS } from '@/lib/constants'

interface StatusTabsProps {
  activeStatus: StudentStatus
  onStatusChange: (status: StudentStatus) => void
  statusCounts: Record<StudentStatus, number>
}

const StatusTabs: React.FC<StatusTabsProps> = ({ activeStatus, onStatusChange, statusCounts }) => {
  return (
    <div className="flex space-x-2">
      {Object.values(StudentStatus).map(status => (
        <button
          key={status}
          onClick={() => onStatusChange(status)}
          className={`px-4 py-2 rounded-lg border ${
            activeStatus === status 
              ? getStatusColor(status, STUDENT_STATUS_COLORS)
              : 'border-gray-300 text-gray-700 bg-white'
          }`}
        >
          {getStatusLabel(status, STUDENT_STATUS_LABELS)}
          <span className="ml-2 px-2 py-1 rounded-full text-xs">
            {statusCounts[status]}
          </span>
        </button>
      ))}
    </div>
  )
}
```

## 3. Sử dụng trong Services

### 3.1. Student Service

```typescript
import { StudentStatus, mapVietnameseStatusToEnum, mapEnumToVietnameseStatus } from '@/lib/constants'

class StudentService {
  // Chuyển đổi status từ API response
  mapStudentFromAPI(apiStudent: any) {
    return {
      ...apiStudent,
      status: mapVietnameseStatusToEnum(apiStudent.status)
    }
  }
  
  // Chuyển đổi status để gửi lên API
  mapStudentToAPI(student: any) {
    return {
      ...student,
      status: mapEnumToVietnameseStatus(student.status)
    }
  }
  
  // Filter students by status
  filterStudentsByStatus(students: any[], status: StudentStatus) {
    if (status === StudentStatus.ALL) {
      return students
    }
    
    return students.filter(student => student.status === status)
  }
}
```

## 4. Sử dụng trong Utils

### 4.1. Student Utils

```typescript
import { StudentStatus, STUDENT_STATUS_LABELS } from '@/lib/constants'

export function getStudentStatusCounts(students: any[]) {
  const counts = {
    [StudentStatus.ALL]: students.length,
    [StudentStatus.PENDING]: 0,
    [StudentStatus.UPCOMING]: 0,
    [StudentStatus.STUDYING]: 0,
    [StudentStatus.RESERVED]: 0,
    [StudentStatus.STOPPED]: 0,
    [StudentStatus.GRADUATED]: 0,
  }
  
  students.forEach(student => {
    if (student.status in counts) {
      counts[student.status]++
    }
  })
  
  return counts
}

export function updateStudentStatus(students: any[], studentId: string, newStatus: StudentStatus) {
  return students.map(student => 
    student.id === studentId 
      ? { ...student, status: newStatus }
      : student
  )
}
```

## 5. Sử dụng trong Types

### 5.1. Type Definitions

```typescript
import { StudentStatus, ClassStatus, Gender } from '@/lib/constants'

export interface Student {
  id: string
  name: string
  email: string
  status: StudentStatus
  gender: Gender
}

export interface Class {
  id: string
  name: string
  status: ClassStatus
}

export interface StudentFilters {
  search: string
  status: StudentStatus
  gender?: Gender
}
```

## 6. Sử dụng trong Forms

### 6.1. Form Validation

```typescript
import { StudentStatus, isValidStatus } from '@/lib/constants'

export function validateStudentForm(data: any) {
  const errors: string[] = []
  
  if (!isValidStatus(data.status, StudentStatus)) {
    errors.push('Trạng thái học sinh không hợp lệ')
  }
  
  return errors
}
```

### 6.2. Form Options

```typescript
import { Gender, createSelectOptions, GENDER_LABELS } from '@/lib/constants'

const genderOptions = createSelectOptions(Gender, GENDER_LABELS)

// Sử dụng trong form
<select name="gender">
  {genderOptions.map(option => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ))}
</select>
```

## 7. Sử dụng trong API Calls

### 7.1. API Request/Response

```typescript
import { StudentStatus, ClassStatus } from '@/lib/constants'

// API Request
const getStudents = async (status?: StudentStatus) => {
  const params = new URLSearchParams()
  if (status && status !== StudentStatus.ALL) {
    params.append('status', status)
  }
  
  const response = await fetch(`/api/students?${params}`)
  return response.json()
}

// API Response handling
const handleStudentResponse = (data: any[]) => {
  return data.map(student => ({
    ...student,
    status: mapVietnameseStatusToEnum(student.status)
  }))
}
```

## 8. Best Practices

### 8.1. Luôn sử dụng constants thay vì hardcode strings

```typescript
// ❌ Không nên
if (student.status === 'studying') {
  // ...
}

// ✅ Nên sử dụng
if (student.status === StudentStatus.STUDYING) {
  // ...
}
```

### 8.2. Sử dụng helper functions

```typescript
// ❌ Không nên
const statusLabel = student.status === 'studying' ? 'Đang học' : 'Khác'

// ✅ Nên sử dụng
const statusLabel = getStatusLabel(student.status, STUDENT_STATUS_LABELS)
```

### 8.3. Validate status trước khi sử dụng

```typescript
// ✅ Luôn validate
if (isValidStatus(status, StudentStatus)) {
  // Xử lý status
} else {
  console.error('Invalid status:', status)
}
```

## 9. Migration từ code cũ

### 9.1. Thay thế hardcoded strings

```typescript
// Trước
const statusLabels = {
  'studying': 'Đang học',
  'pending': 'Chờ xếp lớp'
}

// Sau
import { STUDENT_STATUS_LABELS } from '@/lib/constants'
// Sử dụng STUDENT_STATUS_LABELS thay vì statusLabels
```

### 9.2. Cập nhật type definitions

```typescript
// Trước
type StudentStatus = 'studying' | 'pending' | 'graduated'

// Sau
import { StudentStatus } from '@/lib/constants'
// Sử dụng StudentStatus enum
```

## 10. Lưu ý quan trọng

1. **Luôn import constants từ file tập trung** thay vì định nghĩa lại
2. **Sử dụng helper functions** để làm việc với status
3. **Validate status** trước khi sử dụng
4. **Cập nhật constants** khi có thay đổi yêu cầu
5. **Test kỹ** khi thay đổi constants để đảm bảo không break code
