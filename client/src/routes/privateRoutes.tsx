import DefaultLayout from "../layouts/DefaultLayout/DefaultLayout";
import { Route } from "react-router-dom";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import { CenterOwnerDashboard } from "../pages/manager/Center-dashboard";
import StudentsManagement from "../pages/manager/Student-management/StudentManagement";
import TeacherManageClass from "../pages/Teacher/Teacher-manage-class/Teacher-manage-class";
import CenterSchedulePage from "../pages/manager/Center-schedule/CenterSchedulePage";
import ScoreInputPage from "../pages/Teacher/PointManagement/Score_input";
import ViewStudentPage from "../pages/Teacher/PointManagement/Score_view";
import TeacherQnmsManagement from "../pages/manager/Teacher-management/TeacherManagement";
import TeacherQnmsInfo from "../pages/manager/Teacher-management/pages/TeacherQnmsInfo";
import AddEmployee from "../pages/manager/Teacher-management/pages/AddTeacher";
import { ClassDetailsPage } from "../pages/Teacher/Teacher-manage-class/detail-class/class-details-page";
import TeacherSchedule from "../pages/Teacher/Teacher-schedule/Teacher-schedule";
import { ProfilePage } from "../pages/Auth/Profile";
import PermissionTestPage from "../pages/manager/PermissionTestPage";
import { ClassManagement } from "../pages/manager/Class-management/ClassManagement";
import CreateClass from "../pages/manager/Class-management/AddClass";
import AttendanceTable from "../pages/Teacher/Attendance-Manage/Attendance-Table";
import LeaveRequestPage from "../pages/Teacher/LeaveRequest/LeaveRequestPage";
import MyRequests from "../pages/Teacher/My-request/MyRequests";
import FileUpload from "../pages/Teacher/FileManagement/File_upload";
import FileManage from "../pages/Teacher/FileManagement/File_management";
import SessionDetails from "../pages/Teacher/Session-details/SessionDetails";
import StudentHomepage from "../pages/Student/Student-homepage";
import StudentSchedule from "../pages/Student/My-schedule/Student-schedule";
import StudentClassesPage from "../pages/Student/MyClass/studentClass";
import StudentClassDetailPage from "../pages/Student/MyClass/studentClassDetail";

import ClassDetail from "../pages/manager/Class-management/ClassDetail";


export const privateRoutes = (
  <>
    <Route element={<DefaultLayout />}>
      {/* Profile chung cho tất cả user */}
      <Route path="/profile" element={<AuthMiddleware />}>
        <Route index element={<ProfilePage />} />
      </Route>

      {/* Chủ trung tâm */}
      <Route path="/center-qn" element={<AuthMiddleware allowedRoles={['center_owner']} />}>
        <Route index element={<CenterOwnerDashboard />} />
        <Route path="students" element={<StudentsManagement />} />
        <Route path="classes" element={<ClassManagement />} />
        <Route path="classes/create" element={<CreateClass />} />
        <Route path="classes/:id" element={<ClassDetail />} />
        <Route path="teachers" element={<TeacherQnmsManagement />} />
        <Route path="teachers/add" element={<AddEmployee />} />
        <Route path="teachers/:id" element={<TeacherQnmsInfo />} />
        <Route path="teachers/schedule" element={<CenterSchedulePage />} />
        <Route path="permission-test" element={<PermissionTestPage />} />
      </Route>

      {/* Giáo viên */}
      <Route path="/teacher" element={<AuthMiddleware allowedRoles={['teacher']} />}>
        {/* <Route path="profile" element={<TeacherProfilePage />} /> */}
        <Route path="schedule" element={<TeacherSchedule />} />
        <Route path="classes" element={<TeacherManageClass />} />
        <Route path="classes/:teacherClassAssignmentId" element={<ClassDetailsPage />} />
        <Route path="grades/input" element={<ScoreInputPage />} />
        <Route path="grades/view" element={<ViewStudentPage />} />
        <Route path="attendance" element={<AttendanceTable />} />
        <Route path="documents/upload" element={<FileUpload />} />
        <Route path="documents/manage" element={<FileManage />} />

        {/* Hợp nhất conflict: Giữ cả hai route attendance & leave */}
        <Route path="schedule/attendance/:classSessionId" element={<AttendanceTable />} />
        <Route path="session-details/:sessionId" element={<SessionDetails />} />
        <Route path="schedule/leave" element={<LeaveRequestPage />} />
        <Route path="schedule/my-requests" element={<MyRequests />} />
      </Route>

      {/* Học sinh */}
      <Route path="/student" element={<AuthMiddleware allowedRoles={['student']} />}>
        <Route index element={<StudentHomepage />} />
        <Route path="my-schedule" element={<StudentSchedule />} />
        <Route path="my-classes" element={<StudentClassesPage />} />
        <Route path="my-classes/:classId" element={<StudentClassDetailPage />} />
        <Route path="grades" element={<div>Student Grades - Coming Soon</div>} />
      </Route>

      {/* Phụ huynh */}
      <Route path="/parent" element={<AuthMiddleware allowedRoles={['parent']} />}>
        <Route index element={<div>Parent Dashboard - Coming Soon</div>} />
        <Route path="children" element={<div>Children Management - Coming Soon</div>} />
        <Route path="reports" element={<div>Reports - Coming Soon</div>} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AuthMiddleware allowedRoles={['admin']} />}>
        <Route index element={<div>Admin Dashboard - Coming Soon</div>} />
        <Route path="users" element={<div>User Management - Coming Soon</div>} />
        <Route path="system" element={<div>System Settings - Coming Soon</div>} />
      </Route>
    </Route>
  </>
);
