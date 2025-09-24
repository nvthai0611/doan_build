import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { PostsModule } from './modules/posts/posts.module';
import { ConfigModule } from '@nestjs/config';
import { AuthMiddleware } from './common/middleware/auth/auth.middleware';
// import { RoleMiddleware } from './common/middleware/role/role.middleware';
// import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { AuthService } from './modules/auth/auth.service';
import { PrismaService } from './db/prisma.service';
import { TeachersService } from './modules/teachers/teachers.service';
import { TeachersModule } from './modules/manager/teachers/teachers.module';
import { StudentsModule } from './modules/manager/students/students.module';
import { UsersModule } from './modules/identity/users/users.module';
import { ParentsModule } from './modules/identity/parents/parents.module';
import { TeachersModule } from './modules/identity/teachers/teachers.module';
import { StudentsModule } from './modules/identity/students/students.module';
import { SchoolsModule } from './modules/school/schools/schools.module';
import { ClassesModule } from './modules/school/classes/classes.module';
import { ClassSessionsModule } from './modules/school/class-sessions/class-sessions.module';
import { SubjectsModule } from './modules/school/subjects/subjects.module';
import { RoomsModule } from './modules/school/rooms/rooms.module';
import { EnrollmentsModule } from './modules/school/enrollments/enrollments.module';
import { ClassRequestsModule } from './modules/school/class-requests/class-requests.module';
import { ScheduleChangesModule } from './modules/school/schedule-changes/schedule-changes.module';
import { AssessmentsModule } from './modules/academic/assessments/assessments.module';
import { GradesModule } from './modules/academic/grades/grades.module';
import { AttendancesModule } from './modules/academic/attendances/attendances.module';
import { ReportsModule } from './modules/academic/reports/reports.module';
import { NotificationsModule } from './modules/communication/notifications/notifications.module';
import { AlertsModule } from './modules/communication/alerts/alerts.module';
import { ContractsModule } from './modules/hr/contracts/contracts.module';
import { PayrollsModule } from './modules/hr/payrolls/payrolls.module';
import { TeacherDocumentsModule } from './modules/hr/teacher-documents/teacher-documents.module';
import { LeaveRequestsModule } from './modules/hr/leave-requests/leave-requests.module';
import { AuditLogsModule } from './modules/system/audit-logs/audit-logs.module';
import { FeeStructuresModule } from './modules/finance/fee-structures/fee-structures.module';
import { FeeRecordsModule } from './modules/finance/fee-records/fee-records.module';
import { PaymentsModule } from './modules/finance/payments/payments.module';
import { MaterialsModule } from './modules/academic/materials/materials.module';
import { StudentParentLinkModule } from './modules/identity/student-parent-link/student-parent-link.module';
import { StudentReportsModule } from './modules/academic/student-reports/student-reports.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ProductsModule,
    PostsModule,
    AuthModule,
    TeachersModule,
    StudentsModule,
    UsersModule,
    ParentsModule,
    SchoolsModule,
    ClassesModule,
    ClassSessionsModule,
    SubjectsModule,
    RoomsModule,
    EnrollmentsModule,
    ClassRequestsModule,
    ScheduleChangesModule,
    AssessmentsModule,
    GradesModule,
    AttendancesModule,
    ReportsModule,
    NotificationsModule,
    AlertsModule,
    ContractsModule,
    PayrollsModule,
    TeacherDocumentsModule,
    LeaveRequestsModule,
    AuditLogsModule,
    FeeStructuresModule,
    FeeRecordsModule,
    PaymentsModule,
    MaterialsModule,
    StudentParentLinkModule,
    StudentReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthService, PrismaService, TeachersService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // thích cấu hình như nào thì cấu hình
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'auth/profile',
        method: RequestMethod.GET,
      },
      {
        path: 'auth/logout',
        method: RequestMethod.POST,
      },
    );
    // {path: 'users', method: RequestMethod.GET} // áp dụng cho tất cả
    // consumer.apply(RoleMiddleware).forRoutes('users'); // chỉ áp dụng cho router users
  }
}
