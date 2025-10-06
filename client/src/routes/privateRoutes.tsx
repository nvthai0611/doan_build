import DefaultLayout from "../layouts/DefaultLayout/DefaultLayout";
import { Route } from "react-router-dom";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import { CenterOwnerDashboard } from "../pages/manager/Center-dashboard";
import TeacherProfilePage from "../pages/teacher/Teacher-profile";
import StudentsManagement from "../pages/manager/Student-management/StudentManagement";
import  TeacherManageClass  from "../pages/teacher/Teacher-manage-class/Teacher-manage-class";
import CenterSchedulePage from "../pages/manager/Center-schedule/CenterSchedulePage";

import TeacherQnmsManagement from "../pages/manager/Teacher-management/TeacherManagement";
import TeacherQnmsInfo from "../pages/manager/Teacher-management/pages/TeacherQnmsInfo";
import { ClassDetailsPage } from "../pages/teacher/Teacher-manage-class/detail-class/class-details-page";
import TeacherSchedule from "../pages/teacher/Teacher-schedule/Teacher-schedule";
import { ProfilePage } from "../pages/Auth/Profile";
import PermissionTestPage from "../pages/manager/PermissionTestPage";
import GradeInputPage from "../pages/teacher/PointManagement/Score_input";
import StudentGradesPage from "../pages/teacher/PointManagement/Score_view";
export const privateRoutes = (
  <>
    <Route element={<DefaultLayout />}>
      {/* Profile chung cho tất cả user */}
      <Route path="/profile" element={<AuthMiddleware />}>
        <Route index element={<ProfilePage />} />
      </Route>

      {/* Chủ trung tâm */}
      <Route path="/center-qn" element={<AuthMiddleware allowedRoles={['center_owner']}/>}>
        <Route index element={<CenterOwnerDashboard />} />
        <Route path="students" element={<StudentsManagement />} />
        <Route path="teachers" element={<TeacherQnmsManagement />} />
        <Route path="teachers/:id" element={<TeacherQnmsInfo />} />
        <Route path="teachers/schedule" element={<CenterSchedulePage />} />
        <Route path="permission-test" element={<PermissionTestPage />} />
        {/* có thể thêm: /finance, /reports, ... */}
      </Route>

      {/* Giáo viên */}
      <Route path="/teacher" element={<AuthMiddleware allowedRoles={['teacher']}/>}>
        <Route path="profile" element={<TeacherProfilePage />} />
        <Route path="schedule" element={<TeacherSchedule />} />
        {/* thêm: /classes, /attendance, ... */}
        <Route path="classes" element={<TeacherManageClass />} />
        <Route path="classes/:teacherClassAssignmentId" element={<ClassDetailsPage />} />
        <Route path="grades/input" element={<GradeInputPage/>}/>
        <Route path="grades/view" element={<StudentGradesPage/>}/>
      </Route>

      {/* Học sinh */}
      <Route path="/student" element={<AuthMiddleware allowedRoles={['student']}/>}>
        <Route index element={<div>Student Dashboard - Coming Soon</div>} />
        <Route path="schedule" element={<div>Student Schedule - Coming Soon</div>} />
        <Route path="grades" element={<div>Student Grades - Coming Soon</div>} />
      </Route>

      {/* Phụ huynh */}
      <Route path="/parent" element={<AuthMiddleware allowedRoles={['parent']}/>}>
        <Route index element={<div>Parent Dashboard - Coming Soon</div>} />
        <Route path="children" element={<div>Children Management - Coming Soon</div>} />
        <Route path="reports" element={<div>Reports - Coming Soon</div>} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AuthMiddleware allowedRoles={['admin']}/>}>
        <Route index element={<div>Admin Dashboard - Coming Soon</div>} />
        <Route path="users" element={<div>User Management - Coming Soon</div>} />
        <Route path="system" element={<div>System Settings - Coming Soon</div>} />
      </Route>
    </Route>
  </>
);
