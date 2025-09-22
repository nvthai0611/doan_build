import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";


const GuestMiddleware = () => {
  const { user } = useAuth();
  return !user ? <Outlet /> : <Navigate to="/center-qn" />;
};

export default GuestMiddleware;


