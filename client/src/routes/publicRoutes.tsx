import DefaultLayout from "../layouts/DefaultLayout/DefaultLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
import Home from "../pages/Home/Home";
import { LoginForm } from "../pages/Auth/Login";
import { Route, Navigate } from "react-router-dom";
import GuestMiddleware from "../middlewares/GuestMiddleware";
export const publicRoutes = (
  <>
    <Route element={<DefaultLayout />}>
      <Route path="/" element={<Navigate to="/center-qn" replace />} />
      <Route path="/san-pham">
      </Route>
    </Route>
    <Route element={<AuthLayout />}>
      <Route element={<GuestMiddleware />}>
        <Route path="/auth/login" element={<LoginForm />} />
      </Route>
    </Route>
  </>
);
