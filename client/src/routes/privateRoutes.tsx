import DefaultLayout from "../layouts/DefaultLayout/DefaultLayout";
import { Route } from "react-router-dom";
import Profile from "../pages/Auth/Profile";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import { CenterOwnerDashboard } from "../pages/manager/Center-dashboard";
export const privateRoutes = (
  <>
    <Route element={<DefaultLayout />}>
      <Route element={<AuthMiddleware />}>
        <Route path="/center-qn" element={<CenterOwnerDashboard />} />
      </Route>
    </Route>
  </>
);
