import DefaultLayout from "../layouts/DefaultLayout/DefaultLayout";
import { Route } from "react-router-dom";
import Profile from "../pages/Auth/Profile";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import { CenterOwnerDashboard } from "../pages/manager/Center-dashboard";
import TeacherProfilePage from "../pages/Teacher/Teacher-profile";
export const privateRoutes = (
  <>
    <Route element={<DefaultLayout />}>
      <Route element={<AuthMiddleware />}>
        <Route path="/center-qn" element={<CenterOwnerDashboard />} />
        <Route path="/teacher/profile" element={<TeacherProfilePage />} />
      </Route>
    </Route>
  </>
);
