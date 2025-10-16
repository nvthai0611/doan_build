import DefaultLayout from "../layouts/DefaultLayout/DefaultLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
import Home from "../pages/Home/Home";
import { LoginForm } from "../pages/Auth/Login";
import { Route, Navigate } from "react-router-dom";
import GuestMiddleware from "../middlewares/GuestMiddleware";
import { useAuth } from "../lib/auth";

// Component để redirect dựa trên role
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    console.log("RoleBasedRedirect: No user, redirecting to login");
    return <Navigate to="/auth/login" replace />;
  }
  
  console.log("RoleBasedRedirect: User role:", user.role);
  
  switch (user.role) {
    case 'center_owner':
      console.log("RoleBasedRedirect: Redirecting to /center-qn");
      return <Navigate to="/center-qn" replace />;
    case 'teacher':
      console.log("RoleBasedRedirect: Redirecting to /teacher/profile");
      return <Navigate to="/teacher/profile" replace />;
    case 'student':
      console.log("RoleBasedRedirect: Redirecting to /student/profile");
      return <Navigate to="/student/profile" replace />;
    case 'parent':
      console.log("RoleBasedRedirect: Redirecting to /parent");
      return <Navigate to="/parent" replace />;
    case 'admin':
      console.log("RoleBasedRedirect: Redirecting to /admin");
      return <Navigate to="/admin" replace />;
    default:
      console.log("RoleBasedRedirect: Unknown role, redirecting to login");
      return <Navigate to="/auth/login" replace />;
  }
};

export const publicRoutes = (
  <>
    <Route path="/" element={<RoleBasedRedirect />} />
    <Route element={<AuthLayout />}>
      <Route element={<GuestMiddleware />}>
        <Route path="/auth/login" element={<LoginForm />} />
      </Route>
    </Route>
  </>
);
