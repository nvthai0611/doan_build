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
export const privateRoutes = (
  <>
     <Route element={<DefaultLayout />}>
    {/* Chủ trung tâm */}
    <Route path="/center-qn" element={<AuthMiddleware/>}>
      <Route path="" element={<CenterOwnerDashboard />} />
      <Route path="students" element={<StudentsManagement />} />
        <Route path="teachers" element={<TeacherQnmsManagement />} />
        <Route path="teachers/:id" element={<TeacherQnmsInfo />} />
        <Route path="teachers/schedule" element={<CenterSchedulePage />} />
      {/* có thể thêm: /finance, /reports, ... */}
    </Route>

    {/* Giáo viên */}
    <Route path="/teacher" element={<AuthMiddleware/>}>
      <Route path="profile" element={<TeacherProfilePage />} />
      {/* thêm: /classes, /attendance, ... */}
      <Route path="classes" element={<TeacherManageClass />} />
    </Route>
  </Route>
  </>
);
