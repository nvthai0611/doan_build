import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";
const AuthMiddleware = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/auth/login" />;
};

export default AuthMiddleware;


