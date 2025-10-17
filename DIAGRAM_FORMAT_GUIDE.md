# Form Chuẩn cho Sequence Diagram và Class Diagram

## Sequence Diagram Format

### Cấu trúc Participants
- **Actor**: Người dùng cuối (Center Owner, Teacher, Student, Parent)
- **Boundary**: UI Components (React components)
- **Control**: Controllers và Services (Backend logic)
- **Entity**: Domain entities (Prisma models)
- **Database**: Database (PostgreSQL)

### Format chuẩn:
```plantuml
@startuml [Use Case Name]

title [Use Case Name]

actor "[Role]" as User
boundary "[UI Component]" as UI
control "[Controller]" as Controller
control "[Service]" as Service
entity "[Entity]" as Entity
database "Database" as DB

== 1. [Section Name] ==
User -> UI: 1.1 [Action]
activate UI
UI -> Controller: 1.2 [API Call]
activate Controller
Controller -> Service: 1.3 [Business Logic]
activate Service
Service -> Entity: 1.4 [Domain Operation]
activate Entity
Entity -> DB: 1.5 [ORM Query]
note right: prisma.entity.method()
DB --> Entity: 1.6 result
Entity --> Service: 1.7 data
deactivate Entity
Service --> Controller: 1.8 response
deactivate Service
Controller --> UI: 1.9 response
deactivate Controller
UI --> User: 1.10 display result
deactivate UI

@enduml
```

### Quy tắc:
- Sử dụng số thứ tự cho các luồng (1.1, 1.2, 1.3...)
- Có activate/deactivate cho mỗi component
- Có notes cho SQL queries (ORM syntax)
- Chia thành sections với ==
- Có alt/else cho error handling

## Class Diagram Format

### Cấu trúc Classes

#### 1. Domain Entities (từ Prisma)
```plantuml
class "[EntityName]" as EntityName {
  +id: UUID
  +field1: String
  +field2: Number
  +field3: Date
  +createdAt: DateTime
  +updatedAt: DateTime
}
```

#### 2. DTOs (Data Transfer Objects)
```plantuml
class "[DtoName]" as DtoName {
  +field1: String
  +field2: Number
  +field3: Date
}
```

#### 3. Application Layer
```plantuml
class "[Feature]Controller" as Controller {
  +method1(params): ReturnType
  +method2(params): ReturnType
}

class "[Feature]Service" as Service {
  +method1(params): ReturnType
  +method2(params): ReturnType
}

class "[Feature]UI" as UI {
  +loadData(): Promise<DataType>
  +handleAction(): void
  +renderContent(): JSX.Element
}
```

### Format chuẩn:
```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam backgroundColor #FFFFFF
skinparam classFontSize 12
skinparam class {
  BackgroundColor White
  BorderColor Black
}

' ========== Domain entities ==========
class "[Entity1]" as Entity1 {
  +id: UUID
  +field: Type
}

class "[Entity2]" as Entity2 {
  +id: UUID
  +field: Type
}

' ========== DTOs ==========
class "[Dto1]" as Dto1 {
  +field: Type
}

class "[Dto2]" as Dto2 {
  +field: Type
}

' ========== Application layer ==========
class "[Feature]Controller" as Controller {
  +method(params): ReturnType
}

class "[Feature]Service" as Service {
  +method(params): ReturnType
}

class "[Feature]UI" as UI {
  +method(): ReturnType
}

' ========== Relationships ==========
Entity1 --> Entity2 : foreignKey
Service ..> Entity1 : uses
Controller ..> Service : calls
Controller ..> Dto1 : returns
UI ..> Dto1 : uses

@enduml
```

### Quan hệ:
- **Entities**: `-->` cho foreign keys
- **Service**: `..>` Entity (uses)
- **Controller**: `..>` Service (calls)
- **Controller**: `..>` DTO (returns)
- **UI**: `..>` DTO (uses)
- **Composition**: `*--` cho DTOs lồng nhau

## Ví dụ cụ thể

### Sequence Diagram - View Teacher Details
```plantuml
@startuml View Teacher Details

title View Teacher Details

actor "Center Owner" as User
boundary "TeacherInfo UI" as UI
control "Teacher Controller" as Controller
control "Teacher Service" as Service
entity "User Entity" as UserEntity
entity "Teacher Entity" as TeacherEntity
entity "School Entity" as SchoolEntity
database "Database" as DB

== 1. Load Teacher Details ==
User -> UI: 1.1 Navigate to Teacher Details page
activate UI
UI -> Controller: 1.2 GET /teachers/{id}
activate Controller
Controller -> Service: 1.3 findOneTeacher(id)
activate Service
Service -> TeacherEntity: 1.4 findTeacherWithRelations()
activate TeacherEntity
TeacherEntity -> DB: 1.5 prisma.teacher.findUnique()
note right: Include user and school data
DB --> TeacherEntity: 1.6 teacher data
TeacherEntity --> Service: 1.7 teacher with relations
deactivate TeacherEntity
Service --> Controller: 1.8 teacher response
deactivate Service
Controller --> UI: 1.9 HTTP Response
deactivate Controller
UI --> User: 1.10 Display teacher details
deactivate UI

== 2. Switch Tabs ==
User -> UI: 2.1 Click different tab
activate UI
UI -> UI: 2.2 Update activeTab state
UI -> Controller: 2.3 GET /teachers/{id}/schedule
activate Controller
Controller -> Service: 2.4 getTeacherSchedule(id)
activate Service
Service -> TeacherEntity: 2.5 findTeacherSchedule()
activate TeacherEntity
TeacherEntity -> DB: 2.6 prisma.teacherClassAssignment.findMany()
note right: Get teacher's classes and schedule
DB --> TeacherEntity: 2.7 schedule data
TeacherEntity --> Service: 2.8 schedule response
deactivate TeacherEntity
Service --> Controller: 2.9 schedule response
deactivate Service
Controller --> UI: 2.10 HTTP Response
deactivate Controller
UI --> User: 2.11 Display tab content
deactivate UI

@enduml
```

### Sequence Diagram - Update Teacher
```plantuml
@startuml Update Teacher

title Update Teacher

actor "Center Owner" as User
boundary "EditTeacher UI" as UI
control "Teacher Controller" as Controller
control "Teacher Service" as Service
entity "User Entity" as UserEntity
entity "Teacher Entity" as TeacherEntity
database "Database" as DB

== 1. Open Edit Dialog ==
User -> UI: 1.1 Click Edit button
activate UI
UI -> UI: 1.2 Open edit dialog
note right: Set editFormData with current teacher data
UI --> User: 1.3 Display edit form
deactivate UI

== 2. Update Teacher Info ==
User -> UI: 2.1 Modify form fields
activate UI
UI -> UI: 2.2 Update editFormData state
User -> UI: 2.3 Click Save button
UI -> Controller: 2.4 PATCH /teachers/{id}
activate Controller
Controller -> Service: 2.5 updateTeacher(id, data)
activate Service
Service -> UserEntity: 2.6 updateUserData()
activate UserEntity
UserEntity -> DB: 2.7 prisma.user.update()
note right: Update fullName, email, phone, etc.
DB --> UserEntity: 2.8 updated user
UserEntity --> Service: 2.9 success
deactivate UserEntity
Service --> Controller: 2.10 success response
deactivate Service
Controller --> UI: 2.11 HTTP Response
deactivate Controller
UI --> User: 2.12 Show success message & refresh data
deactivate UI

== 3. Toggle Teacher Status ==
User -> UI: 3.1 Click toggle status switch
activate UI
UI -> Controller: 3.2 PATCH /teachers/{id}/toggle-status
activate Controller
Controller -> Service: 3.3 toggleTeacherStatus(id)
activate Service
Service -> UserEntity: 3.4 updateUserStatus()
activate UserEntity
UserEntity -> DB: 3.5 prisma.user.update()
note right: Toggle isActive field
DB --> UserEntity: 3.6 updated user
UserEntity --> Service: 3.7 success
deactivate UserEntity
Service --> Controller: 3.8 success response
deactivate Service
Controller --> UI: 3.9 HTTP Response
deactivate Controller
UI --> User: 3.10 Show success message & refresh data
deactivate UI

@enduml
```

### Class Diagram - View Teacher Details
```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam backgroundColor #FFFFFF
skinparam classFontSize 12
skinparam class {
  BackgroundColor White
  BorderColor Black
}

' ========== Domain entities ==========
class "User" as User {
  +id: UUID
  +email: String
  +fullName: String
  +username: String
  +phone: String
  +role: String
  +isActive: Boolean
  +gender: Gender
  +birthDate: Date
  +createdAt: DateTime
  +updatedAt: DateTime
}

class "Teacher" as Teacher {
  +id: UUID
  +userId: UUID
  +schoolId: UUID
  +subjects: String[]
  +createdAt: DateTime
  +updatedAt: DateTime
}

class "School" as School {
  +id: UUID
  +name: String
  +address: String
  +phone: String
  +createdAt: DateTime
  +updatedAt: DateTime
}

' ========== DTOs ==========
class "TeacherResponseDto" as TeacherResponseDto {
  +id: String
  +name: String
  +email: String
  +phone: String
  +username: String
  +role: String
  +gender: String
  +birthDate: String
  +status: Boolean
  +notes: String
  +subjects: String[]
  +schoolName: String
  +schoolAddress: String
  +createdAt: DateTime
  +updatedAt: DateTime
}

' ========== Application layer ==========
class "TeacherManagementController" as Controller {
  +findOne(id: string): Promise<TeacherResponseDto>
  +getSchedule(id: string): Promise<ScheduleData>
  +getClasses(id: string): Promise<ClassData[]>
  +getLeaveRequests(id: string): Promise<LeaveRequestData[]>
  +getTimesheet(id: string): Promise<TimesheetData[]>
}

class "TeacherManagementService" as Service {
  +findOneTeacher(id: string): Promise<TeacherResponseDto>
  +getTeacherSchedule(id: string): Promise<ScheduleData>
  +getTeacherClasses(id: string): Promise<ClassData[]>
  +getTeacherLeaveRequests(id: string): Promise<LeaveRequestData[]>
  +getTeacherTimesheet(id: string): Promise<TimesheetData[]>
}

class "TeacherInfoUI" as TeacherInfoUI {
  +loadTeacherDetails(teacherId: string): Promise<TeacherResponseDto>
  +switchTab(tab: string): void
  +renderTabContent(tab: string): JSX.Element
}

class "GeneralInfoTab" as GeneralInfoTab {
  +displayTeacherInfo(teacher: TeacherResponseDto): JSX.Element
}

class "ScheduleInfoTab" as ScheduleInfoTab {
  +loadTeacherSchedule(teacherId: string): Promise<ScheduleData>
  +displaySchedule(teacherId: string): JSX.Element
}

class "ClassesInfoTab" as ClassesInfoTab {
  +loadTeacherClasses(teacherId: string): Promise<ClassData[]>
  +displayClasses(teacherId: string): JSX.Element
}

class "LeaveRequestsInfoTab" as LeaveRequestsInfoTab {
  +loadLeaveRequests(teacherId: string): Promise<LeaveRequestData[]>
  +displayLeaveRequests(teacherId: string): JSX.Element
}

class "TimesheetInfoTab" as TimesheetInfoTab {
  +loadTimesheet(teacherId: string): Promise<TimesheetData[]>
  +displayTimesheet(teacherId: string): JSX.Element
}

' ========== Relationships ==========
Teacher --> User : userId
Teacher --> School : schoolId
TeacherInfoUI *-- GeneralInfoTab : general
TeacherInfoUI *-- ScheduleInfoTab : schedule
TeacherInfoUI *-- ClassesInfoTab : classes
TeacherInfoUI *-- LeaveRequestsInfoTab : leave
TeacherInfoUI *-- TimesheetInfoTab : timesheet
Service ..> User : uses
Service ..> Teacher : uses
Service ..> School : uses
Controller ..> Service : calls
Controller ..> TeacherResponseDto : returns
TeacherInfoUI ..> TeacherResponseDto : uses

@enduml
```

### Class Diagram - Update Teacher
```plantuml
@startuml
skinparam classAttributeIconSize 0
skinparam backgroundColor #FFFFFF
skinparam classFontSize 12
skinparam class {
  BackgroundColor White
  BorderColor Black
}

' ========== Domain entities ==========
class "User" as User {
  +id: UUID
  +email: String
  +fullName: String
  +username: String
  +phone: String
  +role: String
  +isActive: Boolean
  +gender: Gender
  +birthDate: Date
  +createdAt: DateTime
  +updatedAt: DateTime
}

class "Teacher" as Teacher {
  +id: UUID
  +userId: UUID
  +schoolId: UUID
  +subjects: String[]
  +createdAt: DateTime
  +updatedAt: DateTime
}

' ========== DTOs ==========
class "UpdateTeacherDto" as UpdateTeacherDto {
  +fullName: String
  +email: String
  +phone: String
  +username: String
  +role: String
  +isActive: Boolean
  +notes: String
}

class "TeacherResponseDto" as TeacherResponseDto {
  +id: String
  +name: String
  +email: String
  +phone: String
  +username: String
  +role: String
  +status: Boolean
  +notes: String
  +createdAt: DateTime
  +updatedAt: DateTime
}

' ========== Application layer ==========
class "TeacherManagementController" as Controller {
  +update(id: string, dto: UpdateTeacherDto): Promise<TeacherResponseDto>
  +toggleStatus(id: string): Promise<TeacherResponseDto>
}

class "TeacherManagementService" as Service {
  +updateTeacher(id: string, dto: UpdateTeacherDto): Promise<TeacherResponseDto>
  +toggleTeacherStatus(id: string): Promise<TeacherResponseDto>
}

class "EditTeacherUI" as EditTeacherUI {
  +openEditDialog(teacher: TeacherResponseDto): void
  +updateTeacherInfo(teacherId: string, data: UpdateTeacherDto): Promise<void>
  +toggleTeacherStatus(teacherId: string): Promise<void>
  +displayEditForm(): JSX.Element
}

' ========== Relationships ==========
Teacher --> User : userId
Service ..> User : uses
Service ..> Teacher : uses
Controller ..> Service : calls
Controller ..> UpdateTeacherDto : accepts
Controller ..> TeacherResponseDto : returns
EditTeacherUI ..> UpdateTeacherDto : uses
EditTeacherUI ..> TeacherResponseDto : uses

@enduml
```

## Quy tắc chung

### Sequence Diagram:
1. **Participants**: Chỉ UI, Controller, Service, Entity, Database
2. **Flow**: Bắt đầu từ User action, kết thúc ở User feedback
3. **Numbering**: Số thứ tự rõ ràng cho mỗi step
4. **Activation**: Có activate/deactivate cho mỗi component
5. **Notes**: Chỉ ghi ORM queries, không ghi HTTP details
6. **Error handling**: Có alt/else cho các trường hợp lỗi

### Class Diagram:
1. **Entities**: Chỉ các field chính, kiểu dữ liệu cơ bản
2. **DTOs**: Chỉ các field cần thiết cho API
3. **Controllers**: Chỉ các method public
4. **Services**: Chỉ các method public
5. **UI**: Chỉ các method chính
6. **Relationships**: Rõ ràng, không phức tạp

### Loại bỏ:
- API Client, HTTP details
- React Query, state management details
- Validation logic chi tiết
- Error handling phức tạp
- Implementation details không cần thiết
