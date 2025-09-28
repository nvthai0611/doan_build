import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { AuthGuard } from "../components/Auth/AuthGuard";

const GuestMiddleware = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <AuthGuard requireAuth={false} fallback={<Navigate to="/" replace />}>
      <Outlet />
    </AuthGuard>
  );
};

export default GuestMiddleware;


