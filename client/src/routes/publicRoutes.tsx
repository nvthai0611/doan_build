import DefaultLayout from "../layouts/DefaultLayout/DefaultLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
import Home from "../pages/Home/Home";
import About from "../pages/About/About";
import Products from "../pages/Products/Products";
import ProductDetail from "../pages/Products/ProductDetail";
import { LoginForm } from "../pages/Auth/Login";
import { Route } from "react-router-dom";
import GuestMiddleware from "../middlewares/GuestMiddleware";
import { DashboardLayout } from "../pages/manager/Layout/Dashboard-layout";
import { CenterOwnerDashboard } from "../pages/manager/Center-dashboard";
export const publicRoutes = (
  <>
    <Route element={<DefaultLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/gioi-thieu" element={<About />} />
      <Route path="/san-pham">
        <Route path="" element={<Products />} />
        <Route path=":id" element={<ProductDetail />} />
      </Route>
    </Route>
    <Route element={<AuthLayout />}>
      <Route element={<GuestMiddleware />}>
        <Route path="/auth/login" element={<LoginForm />} />
      </Route>
    </Route>
  </>
);
