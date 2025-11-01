import DefaultLayout from "../layouts/DefaultLayout/DefaultLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
import Home from "../pages/Home/Home";
import LandingPage from "../pages/Home/LandingPage";
import { LoginForm } from "../pages/Auth/Login";
import { PortalSelection } from "../pages/Auth/PortalSelection";
import { ParentStudentLogin } from "../pages/Auth/ParentStudentLogin";
import { ParentRegister } from "../pages/Auth/ParentRegister";
import { AdminLogin } from "../pages/Auth/AdminLogin";
import NotFound from "../pages/Error/NotFound";
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
    console.log("RoleBasedRedirect: No user, redirecting to portal selection");
    return <Navigate to="/auth" replace />;
  }
  
  console.log("RoleBasedRedirect: User role:", user.role);
  
  // Chỉ parent về homepage, các role khác vào trang quản trị
  switch (user.role) {
    case 'center_owner':
      console.log("RoleBasedRedirect: Redirecting to /center-qn");
      return <Navigate to="/center-qn" replace />;
    case 'teacher':
      console.log("RoleBasedRedirect: Redirecting to /teacher/profile");
      return <Navigate to="/teacher/profile" replace />;
    case 'student':
      console.log("RoleBasedRedirect: Redirecting to /student");
      return <Navigate to="/student" replace />;
    case 'parent':
      console.log("RoleBasedRedirect: Parent redirecting to /parent");
      return <Navigate to="/parent" replace />;
    case 'admin':
      console.log("RoleBasedRedirect: Redirecting to /admin");
      return <Navigate to="/admin" replace />;
    default:
      console.log("RoleBasedRedirect: Unknown role, redirecting to portal selection");
      return <Navigate to="/auth" replace />;
  }
};

export const publicRoutes = (
  <>
    {/* Landing Page - Public */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/home" element={<LandingPage />} />
    
    <Route element={<AuthLayout />}>
      <Route element={<GuestMiddleware />}>
        {/* Portal Selection - Landing page */}
        <Route path="/auth" element={<PortalSelection />} />
        
        {/* Management Portal - Center Owner & Teacher */}
        <Route path="/auth/login/management" element={<LoginForm />} />
        <Route path="/auth/login" element={<Navigate to="/auth/login/management" replace />} />
        
        {/* Family Portal - Parent & Student */}
        <Route path="/auth/login/family" element={<ParentStudentLogin />} />
        <Route path="/auth/register/family" element={<ParentRegister />} />
        
        {/* Admin Portal - IT Admin */}
        <Route path="/auth/login/admin" element={<AdminLogin />} />
      </Route>
    </Route>

    {/* 404 - Not Found (Catch all routes) */}
    <Route path="*" element={<NotFound />} />
  </>
);
