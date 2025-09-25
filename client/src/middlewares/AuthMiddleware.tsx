import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";
const AuthMiddleware = () => {
  const { user, loading } = useAuth();
  
  // Hiển thị loading hoặc chờ đợi khi đang kiểm tra authentication
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? <Outlet /> : <Navigate to="/auth/login" />;
};

export default AuthMiddleware;


