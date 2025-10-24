import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  X, 
  Search, 
  Check, 
  XCircle, 
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '../../../../../hooks/use-toast';

interface ClassJoinRequestsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData?: any;
}

// Mock data - sẽ thay bằng API call
const mockRequests = [
  {
    id: '1',
    student: {
      name: 'Nguyễn Văn A',
      avatar: '',
      email: 'nguyenvana@example.com',
      phone: '0123456789'
    },
    parent: {
      name: 'Nguyễn Văn B',
      email: 'parent@example.com'
    },
    message: 'Xin phép cho con tham gia lớp học này',
    status: 'pending',
    createdAt: '2024-01-15T10:30:00'
  },
  // Add more mock data as needed
];

export const ClassJoinRequestsSheet = ({
  open,
  onOpenChange,
  classData
}: ClassJoinRequestsSheetProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            Chờ duyệt
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <Check className="w-3 h-3 mr-1" />
            Đã duyệt
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Từ chối
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleApprove = (requestId: string) => {
    // TODO: Call API to approve request
    toast({
      title: "Thành công",
      description: "Đã phê duyệt yêu cầu tham gia lớp học",
    });
  };

  const handleReject = (requestId: string) => {
    // TODO: Call API to reject request
    toast({
      title: "Thành công",
      description: "Đã từ chối yêu cầu tham gia lớp học",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = mockRequests.filter(req => 
    req.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (  
    <Sheet open={open} onOpenChange={onOpenChange} modal={true}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">
              Danh sách yêu cầu truy cập
            </SheetTitle>
          </div>

          {classData?.name && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-sm font-medium text-purple-900">{classData.name}</div>
              {classData.classCode && (
                <div className="text-xs text-purple-700 mt-1">Mã lớp: {classData.classCode}</div>
              )}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
              {filteredRequests.filter(r => r.status === 'pending').length} Chờ duyệt
            </Badge>
            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
              {filteredRequests.filter(r => r.status === 'approved').length} Đã duyệt
            </Badge>
            <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">
              {filteredRequests.filter(r => r.status === 'rejected').length} Từ chối
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {paginatedRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">Không có yêu cầu nào</p>
              <p className="text-gray-400 text-xs mt-1">
                {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có yêu cầu tham gia lớp học'}
              </p>
            </div>
          ) : (
            <>
              {/* Request List */}
              <div className="space-y-3">
                {paginatedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b px-4 py-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-blue-200">
                            <AvatarImage src={request.student.avatar} alt={request.student.name} />
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {getInitials(request.student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-gray-900">{request.student.name}</div>
                            <div className="text-xs text-gray-600">Học sinh</div>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      {/* Student Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{request.student.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{request.student.phone}</span>
                        </div>
                      </div>

                      {/* Parent Info */}
                      <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                        <div className="text-xs font-medium text-gray-500">Phụ huynh</div>
                        <div className="text-sm font-medium">{request.parent.name}</div>
                        <div className="text-xs text-gray-600">{request.parent.email}</div>
                      </div>

                      {/* Message */}
                      {request.message && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                            <MessageSquare className="w-3 h-3" />
                            Lời nhắn
                          </div>
                          <div className="text-sm text-gray-700 bg-blue-50 p-2 rounded border-l-2 border-blue-400">
                            {request.message}
                          </div>
                        </div>
                      )}

                      {/* Time */}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        Gửi lúc: {formatDate(request.createdAt)}
                      </div>

                      {/* Actions */}
                      {request.status === 'pending' && (
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(request.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Phê duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleReject(request.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-3 border-t">
                  <div className="text-sm text-gray-600">
                    {filteredRequests.length === 0 
                      ? '0-0 trong 0' 
                      : `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredRequests.length)} trong ${filteredRequests.length}`
                    }
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600 px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ClassJoinRequestsSheet;

