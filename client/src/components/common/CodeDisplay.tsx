import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface CodeDisplayProps {
  code: string;
  hiddenLength?: number; // Số ký tự cần ẩn từ cuối
  className?: string;
  showCopyButton?: boolean;
}

export const CodeDisplay = ({ 
  code, 
  hiddenLength = 4, 
  className = '',
  showCopyButton = true 
}: CodeDisplayProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã: ${code}`);
  };

  // Tạo mã hiển thị với phần ẩn
  const displayCode = code.length > hiddenLength 
    ? code.slice(0, -hiddenLength) + '*'.repeat(hiddenLength)
    : code;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-xs text-gray-400">{code}</span>
      {showCopyButton && (
        <Copy
          className="w-3 h-3 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          onClick={handleCopy}
        />
      )}
    </div>
  );
};

