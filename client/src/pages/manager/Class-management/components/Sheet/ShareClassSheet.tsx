import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Copy, RefreshCw, X, QrCode, ChevronRight, Users, Share2 } from 'lucide-react';
import { useToast } from '../../../../../hooks/use-toast';
import QRCode from 'qrcode';
import { ClassJoinRequestsSheet } from './ClassJoinRequestsSheet';

interface ShareClassSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData?: any;
  pendingRequestsCount?: number;
  onUpdatePassword?: (password: string) => void;
  isLoading?: boolean;
}

export const ShareClassSheet = ({
  open,
  onOpenChange,
  classData,
  pendingRequestsCount = 0,
  onUpdatePassword,
  isLoading = false
}: ShareClassSheetProps) => {
  const { toast } = useToast();
  const [isShareEnabled, setIsShareEnabled] = useState(true);
  const [sharePassword, setSharePassword] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isRequestsSheetOpen, setIsRequestsSheetOpen] = useState(false);


  const shareLink = classData?.id 
    ? `http://localhost:5173/auth/login/family/${classData.id}`
    : ''; 
  // Generate QR Code
  useEffect(() => {
    if (shareLink && open) {
      QRCode.toDataURL(shareLink, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error('Error generating QR code:', err));
    }
  }, [shareLink, open]);

  // Load password from classData
  useEffect(() => {
    if (classData?.password) {
      setSharePassword(classData.password);
    }
  }, [classData]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Đã sao chép",
        description: "Link đã được sao chép vào clipboard",
      });
    });
  };

  const handleRefreshPassword = () => {
    const newPassword = Math.random().toString(36).slice(-8);
    setSharePassword(newPassword);
    toast({
      title: "Thông báo",
      description: "Đã tạo mật khẩu mới",
    });
  };

  const handleSavePassword = () => {
    if (onUpdatePassword) {
      onUpdatePassword(sharePassword);
      toast({
        title: "Thành công",
        description: "Đã cập nhật mật khẩu lớp học",
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={true}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">Chia sẻ lớp học</SheetTitle>
          </div>

          {classData?.name && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-900">{classData.name}</div>
              {classData.classCode && (
                <div className="text-xs text-blue-700 mt-1">Mã lớp: {classData.classCode}</div>
              )}
            </div>
          )}
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Kích hoạt chia sẻ */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Kích hoạt chia sẻ</span>
            <Switch
              checked={isShareEnabled}
              onCheckedChange={(checked) => {
                setIsShareEnabled(checked);
                if (checked) {
                  toast({
                    title: "Thông báo",
                    description: "Lớp học đã được kích hoạt chia sẻ",
                  });
                } else {
                  toast({
                    title: "Thông báo", 
                    description: "Lớp học đã tắt chia sẻ",
                  });
                }
              }}
            />
          </div>

          {/* Hiển thị nội dung khi bật chia sẻ */}
          {isShareEnabled ? (
            <>
              {/* Link chia sẻ */}
          {/* <div className="space-y-2">
            <Label className="text-sm font-medium">Link chia sẻ</Label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1 bg-gray-50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(shareLink)}
                className="px-3"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div> */}

          {/* Mật khẩu */}
          {/* <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Mật khẩu</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshPassword}
                className="h-7 px-2 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Tạo mới
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                value={sharePassword}
                onChange={(e) => setSharePassword(e.target.value)}
                placeholder="Nhập mật khẩu (tùy chọn)"
                type="text"
                className="flex-1"
              />
              {sharePassword && sharePassword !== classData?.password && (
                <Button
                  size="sm"
                  onClick={handleSavePassword}
                  disabled={isLoading}
                  className="px-3"
                >
                  Lưu
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Để trống nếu không muốn đặt mật khẩu cho lớp học
            </p>
          </div> */}

          {/* Danh sách yêu cầu truy cập */}
          <div 
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => setIsRequestsSheetOpen(true)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Danh sách yêu cầu truy cập vào lớp học</div>
                  <div className="text-xs text-gray-500 mt-0.5">Xem và phê duyệt yêu cầu tham gia</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`${pendingRequestsCount > 0 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {pendingRequestsCount} người
                </Badge>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

     
            </>
          ) : (
            /* Hiển thị khi tắt chia sẻ */
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Share2 className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">Không có dữ liệu</p>
            </div>
          )}
        </div>
      </SheetContent>

      {/* Class Join Requests Sheet - Đè lên Share Sheet */}
      <ClassJoinRequestsSheet
        open={isRequestsSheetOpen}
        onOpenChange={setIsRequestsSheetOpen}
        classData={classData}
      />
    </Sheet>
  );
};

export default ShareClassSheet;

