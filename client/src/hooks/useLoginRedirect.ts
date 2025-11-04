import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

/**
 * Hook để xử lý redirect sau khi login
 * Kiểm tra sessionStorage để redirect đến trang đã lưu trước khi login
 */
export const useLoginRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath, { replace: true });
      } else {
        // Default redirect based on role
        // Chỉ parent về homepage, các role khác vào trang quản trị
        const roleRedirects: Record<string, string> = {
          admin: '/admin',
          'center-owner': '/manager',
          center_owner: '/manager',
          teacher: '/teacher',
          parent: '/parent',  // Parent về homepage
          student: '/student',
        };
        
        const defaultPath = roleRedirects[user.role] || '/';
        navigate(defaultPath, { replace: true });
      }
    }
  }, [user, navigate]);
};

