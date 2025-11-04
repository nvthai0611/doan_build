import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { AuthGuard } from "../components/Auth/AuthGuard";

interface AuthMiddlewareProps {
  allowedRoles?: string[];
}

const AuthMiddleware = ({ allowedRoles = [] }: AuthMiddlewareProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Hiển thị loading hoặc chờ đợi khi đang kiểm tra authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <AuthGuard 
      requireAuth={true} 
      allowedRoles={allowedRoles}
      fallback={<Navigate to="/auth/login" state={{ from: location }} replace />}
    >
      <Outlet />
    </AuthGuard>
  );
};

export default AuthMiddleware;


