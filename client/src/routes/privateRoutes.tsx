import DefaultLayout from "../layouts/DefaultLayout/DefaultLayout";
import { Route } from "react-router-dom";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import { CenterOwnerDashboard } from "../pages/manager/CenterDashboard";
import { CenterOwnerHomePage } from "../pages/manager/CenterOwnerHomePage";
import TeacherProfilePage from "../pages/teacher/Teacher-profile";
import StudentsManagement from "../pages/manager/Student-management/StudentManagement";
import TeacherManageClass from "../pages/teacher/Teacher-manage-class/Teacher-manage-class";
import CenterSchedulePage from "../pages/manager/Center-schedule/CenterSchedulePage";
import TodaySessionsPage from "../pages/manager/Center-schedule/TodaySessionsPage";
import ScoreInputPage from "../pages/teacher/PointManagement/ScoreInput";
import ViewStudentPage from "../pages/teacher/PointManagement/ScoreView";
import TeacherQnmsManagement from "../pages/manager/Teacher-management/TeacherManagement";
import TeacherQnmsInfo from "../pages/manager/Teacher-management/pages/TeacherQnmsInfo";
import AddEmployee from "../pages/manager/Teacher-management/pages/AddTeacher";
import { ClassDetailsPage } from "../pages/teacher/Teacher-manage-class/detail-class/class-details-page";
import TeacherSchedule from "../pages/teacher/Teacher-schedule/TeacherSchedule";
import { ProfilePage } from "../pages/Auth/Profile";
import PermissionTestPage from "../pages/manager/PermissionTestPage";
import { ClassManagement } from "../pages/manager/Class-management/ClassManagement";
import CreateClass from "../pages/manager/Class-management/AddClass";
import AttendanceTable from "../pages/teacher/Attendance-Manage/AttendanceTable";
import LeaveRequestPage from "../pages/teacher/LeaveRequest/LeaveRequestPage";
import MyRequests from "../pages/teacher/My-request/MyRequests";
import FileUpload from "../pages/teacher/FileManagement/FileUpload";
import FileManage from "../pages/teacher/FileManagement/FileManagement";
import SessionDetails from "../pages/teacher/Session-details/SessionDetails";
import StudentHomepage from "../pages/Student/StudentHomepage";
import StudentSchedule from "../pages/Student/MySchedule/StudentSchedule";
import StudentClassesPage from "../pages/Student/MyClass/studentClass";
import StudentClassDetailPage from "../pages/Student/MyClass/studentClassDetail";
// import StudentProfilePage from "../pages/Student/Profile/StudentProfile";
import StudentTranscriptPage from "../pages/Student/MyGrades/StudentTranscript";
import IncidentReportPage from "../pages/teacher/IncidentReport/IncidentReport";
import IncidentManagePage from "../pages/teacher/IncidentReport/IncidentManagent";
import IncidentHandlePage from "../pages/manager/Incident-handle/IncidentHandle";
import { ListChildren } from "../pages/Parent/Dashboard/ListChildren/ListChildren";
import { StudentDetailPage } from "../pages/manager/Student-management/components/StudentDetail/student-detail-page";
import ParentManagement from "../pages/manager/Parent-management/ParentManagement";
import ParentDetailPage from "../pages/manager/Parent-management/components/ParentDetail/ParentDetailPage";
import ClassDetail from "../pages/manager/Class-management/ClassDetail";
import { CenterInfoSetting } from "../pages/manager/Settings/CenterInfoSetting";
import { HolidaySetting } from "../pages/manager/Settings/HolidaySetting";
import { ScoreSetting } from "../pages/manager/Settings/ScoreSetting";
import { NotificationSetting } from "../pages/manager/Settings/NotiSetting";
import { TuitionSetting } from "../pages/manager/Settings/TuitionSetting";
import StudentLeaveRequestList from "../pages/Parent/Dashboard/StudentLeaveRequest/StudentLeaveRequestList";
import { StudentLeaveRequestForm } from "../pages/Parent/Dashboard/StudentLeaveRequest/StudentLeaveRequestForm";
import { StudentLeaveRequestList as TeacherStudentLeaveRequestList } from "../pages/teacher/StudentLeaveRequests";
import LeaveRequestManagement from "../pages/manager/RequestsManagement/LeaveRequestManagement";
import SessionRequestManagement from "../pages/manager/RequestsManagement/SessionRequestManagement";
import ChangeScheduleRequestManagement from "../pages/manager/RequestsManagement/ChangeScheduleRequestManagement";
import { ParentOverview } from "../pages/Parent/Dashboard/ParentOverview/ParentOverview";
import { ChildSchedulePage } from "../pages/Parent/Dashboard/ListChildren/ChildSchedulePage";
import ContractsManageme from "../pages/teacher/TeacherContracts/ContractsManage";
import FinancialPage from "../pages/Parent/Financial/Financial-Home";
import { ChildrenClasses } from "../pages/Parent/Dashboard/ChildClass/ChildrenClasses";
import RecruitingClasses from "../pages/Parent/Dashboard/RecruitingClasses/RecruitingClasses";
import { CommitmentsManagement } from "../pages/Parent/Dashboard/Commitments/CommitmentsManagement";
import { FeedbackTeacher } from "../pages/manager/TeacherFeedback-management/TeacherFeedback";
import StudentClassRequestsPage from "../pages/manager/StudentClassRequests/StudentClassRequestsPage";
import { AlertsPage } from "../pages/manager/Alerts/AlertsPage";
import { ShowcasesPage } from '../pages/manager/ShowcaseManagement/ShowcasePage';
import SessionDetail from "../pages/manager/Session-management/SessionDetail";
import NotFound from "../pages/Error/NotFound";
import ClassroomsPage from "../pages/manager/Room-management/ClassRoom";
import SubjectsPage from "../pages/manager/Subject-management/Subject";

export const privateRoutes = (
  <>
    <Route element={<DefaultLayout />}>
      {/* Profile chung cho tất cả user */}
      <Route path="/profile" element={<AuthMiddleware />}>
        <Route index element={<ProfilePage />} />
      </Route>

      {/* Chủ trung tâm */}
      <Route
        path="/center-qn"
        element={<AuthMiddleware allowedRoles={['center_owner']} />}
      >
        <Route index element={<CenterOwnerHomePage />} />
        <Route path="students" element={<StudentsManagement />} />
        <Route path="classes" element={<ClassManagement />} />
        <Route path="classes/:id" element={<ClassDetail />} />
        <Route path="classes/create" element={<CreateClass />} />
        <Route path="classes/session-details/:sessionId" element={<SessionDetail />} />
        <Route path="teachers" element={<TeacherQnmsManagement />} />
        <Route path="teachers/add" element={<AddEmployee />} />
        <Route path="teachers/:id" element={<TeacherQnmsInfo />} />
        <Route path="lich-day-hom-nay" element={<TodaySessionsPage />} />
        <Route path="schedule" element={<CenterSchedulePage />} />
        <Route path="permission-test" element={<PermissionTestPage />} />
        <Route path="permission-test" element={<PermissionTestPage />} />
        <Route path="incidents" element={<IncidentHandlePage />} />
        <Route path="students/:id" element={<StudentDetailPage />} />
        <Route path="parents" element={<ParentManagement />} />
        <Route path="parents/:id" element={<ParentDetailPage />} />
        <Route path="settings/center-info-setting" element={<CenterInfoSetting />} />
        <Route path="settings/holidays-setting" element={<HolidaySetting />} />
        <Route path="settings/score-setting" element={<ScoreSetting />} />
        <Route path="settings/notifications-setting" element={<NotificationSetting />} />
        <Route path="settings/tuition-setting" element={<TuitionSetting />} />
        <Route path="requests/leave-requests" element={<LeaveRequestManagement />} />
        <Route path="requests/session-requests" element={<SessionRequestManagement />} />
        <Route path="requests/change-schedule-requests" element={<ChangeScheduleRequestManagement />} />
        <Route path="requests/student-class-requests" element={<StudentClassRequestsPage />} />
        <Route path="student-class-requests" element={<StudentClassRequestsPage />} />
        <Route path="feedback" element={<FeedbackTeacher />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="communication/showcases" element={<ShowcasesPage />} />
        <Route path="rooms" element={<ClassroomsPage />} />
        <Route path="courses" element={<SubjectsPage />} />
      </Route>

      {/* Giáo viên */}
      <Route
        path="/teacher"
        element={<AuthMiddleware allowedRoles={['teacher']} />}
      >
        <Route path="profile" element={<TeacherProfilePage />} />
        <Route path="schedule" element={<TeacherSchedule />} />
        <Route path="classes" element={<TeacherManageClass />} />
        <Route path="classes/:classId" element={<ClassDetailsPage />} />
        <Route path="grades/input" element={<ScoreInputPage />} />
        <Route path="grades/view" element={<ViewStudentPage />} />
        <Route path="attendance" element={<AttendanceTable />} />
        <Route path="documents/upload" element={<FileUpload />} />
        <Route path="documents/manage" element={<FileManage />} />
        <Route path="incidents/report" element={<IncidentReportPage />} />
        <Route path="incidents/manage" element={<IncidentManagePage />} />
        <Route
          path="classes/:teacherClassAssignmentId/session/:sessionId"
          element={<SessionDetails />}
        />

        {/* Hợp nhất conflict: Giữ cả hai route attendance & leave */}
        <Route
          path="schedule/attendance/:classSessionId"
          element={<AttendanceTable />}
        />
        <Route path="session-details/:sessionId" element={<SessionDetails />} />
        <Route path="requests/leave" element={<LeaveRequestPage />} />
        <Route path="requests/my-requests" element={<MyRequests />} />
        <Route path="requests/student-leave-requests" element={<TeacherStudentLeaveRequestList />} />
        <Route path="contracts" element={<ContractsManageme />} />
      </Route>

      {/* Học sinh */}
      <Route
        path="/student"
        element={<AuthMiddleware allowedRoles={['student']} />}
      >
        <Route index element={<StudentHomepage />} />
        <Route path="my-schedule" element={<StudentSchedule />} />
        <Route path="my-classes" element={<StudentClassesPage />} />
        <Route
          path="my-classes/:classId"
          element={<StudentClassDetailPage />}
        />
        <Route path="my-grades" element={<StudentTranscriptPage />} />
      </Route>

      {/* Phụ huynh */}
      <Route
        path="/parent"
        element={<AuthMiddleware allowedRoles={['parent']} />}
      >
        <Route index element={<ParentOverview />} />
        <Route path="dashboard" element={<ParentOverview />} />
        <Route path="children" element={<ListChildren />} />
        <Route path="classes" element={<ChildrenClasses />} />
        <Route path="recruiting-classes" element={<RecruitingClasses />} />
        <Route path="schedule" element={<ChildSchedulePage />} />
        <Route path="reports" element={<div>Reports - Coming Soon</div>} />
        <Route path="student-leave-requests" element={<StudentLeaveRequestList />} />
        <Route path="student-leave-requests/create" element={<StudentLeaveRequestForm />} />
        <Route path="student-leave-requests/edit/:id" element={<StudentLeaveRequestForm />} />
        <Route path="commitments" element={<CommitmentsManagement />} />
        <Route path="financial" element={<FinancialPage />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={<AuthMiddleware allowedRoles={['admin']} />}
      >
        <Route index element={<div>Admin Dashboard - Coming Soon</div>} />
        <Route
          path="users"
          element={<div>User Management - Coming Soon</div>}
        />
        <Route
          path="system"
          element={<div>System Settings - Coming Soon</div>}
        />
      </Route>

      {/* 404 - Not Found for authenticated users (Catch all routes) */}
      <Route path="*" element={<NotFound />} />
    </Route>
  </>
);
