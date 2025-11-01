import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
            404
          </h1>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-white dark:bg-gray-800 p-6 rounded-full shadow-lg">
              <Search className="w-16 h-16 text-blue-600" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Trang không tìm thấy
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vui lòng kiểm tra lại URL hoặc quay về trang chủ.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Button>
          <Button
            onClick={() => navigate('/')}
            size="lg"
            className="w-full sm:w-auto gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s',
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

