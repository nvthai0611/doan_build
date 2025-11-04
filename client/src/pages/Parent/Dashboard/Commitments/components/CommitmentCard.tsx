import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  FileText, 
  Eye, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { useToast } from '../../../../../hooks/use-toast';
import { parentCommitmentsService, StudentCommitment } from '../../../../../services/parent/commitments/commitments.service';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { publicClassesService } from '../../../../../services/common/public-classes.service';
import { useQuery } from '@tanstack/react-query';

interface CommitmentCardProps {
  commitment: StudentCommitment;
  studentId: string;
  studentName?: string;
}

export const CommitmentCard = ({ commitment, studentId, studentName }: CommitmentCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Fetch subjects để hiển thị tên môn học
  const { data: subjectsResponse } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => publicClassesService.getSubjects(),
  });
  const subjects = subjectsResponse?.data || [];
  const subjectMap = new Map(subjects.map((s: any) => [s.id, s.name]));

  const getStatusBadge = () => {
    switch (commitment.status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Đang hoạt động
          </Badge>
        );
      case 'expiring_soon':
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            Sắp hết hạn
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Đã hết hạn
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {commitment.status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Không có';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa hợp đồng này? Hợp đồng đang được sử dụng sẽ không thể xóa.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await parentCommitmentsService.deleteCommitment(commitment.id, studentId);
      toast({
        title: "Thành công",
        description: "Đã xóa hợp đồng thành công",
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['commitments', studentId] });
      queryClient.invalidateQueries({ queryKey: ['commitments'] });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể xóa hợp đồng. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
    // Open in new tab
    window.open(commitment.uploadedImageUrl, '_blank');
  };

  const subjectNames = commitment.subjectIds
    .map(id => subjectMap.get(id))
    .filter(Boolean)
    .join(', ') || 'N/A';

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">
                    {commitment.uploadedImageName || 'Bản cam kết'}
                  </h3>
                </div>
                {studentName && (
                  <p className="text-sm text-muted-foreground">
                    Học sinh: <span className="font-medium">{studentName}</span>
                  </p>
                )}
              </div>
              {getStatusBadge()}
            </div>

            {/* Môn học */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Môn học:</p>
              <div className="flex flex-wrap gap-1">
                {commitment.subjectIds.map(subjectId => {
                  const subjectName = subjectMap.get(subjectId);
                  return subjectName ? (
                    <Badge key={subjectId} variant="outline" className="text-xs">
                      {subjectName as string}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>

            {/* Thông tin ngày tháng */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Ngày upload</p>
                  <p className="font-medium">{formatDate(commitment.uploadedAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Hết hạn</p>
                  <p className={`font-medium ${commitment.expiredAt && new Date(commitment.expiredAt) < new Date() ? 'text-red-600' : ''}`}>
                    {formatDate(commitment.expiredAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Ghi chú */}
            {commitment.note && (
              <div className="p-2 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Ghi chú:</p>
                <p className="text-sm">{commitment.note}</p>
              </div>
            )}

            {/* Cảnh báo nếu sắp hết hạn hoặc đã hết hạn */}
            {(commitment.status === 'expiring_soon' || commitment.status === 'expired') && (
              <div className={`p-3 rounded-lg flex items-start gap-2 ${
                commitment.status === 'expired' 
                  ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800' 
                  : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800'
              }`}>
                <AlertCircle className={`w-5 h-5 mt-0.5 ${
                  commitment.status === 'expired' ? 'text-red-600' : 'text-amber-600'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    commitment.status === 'expired' ? 'text-red-800 dark:text-red-200' : 'text-amber-800 dark:text-amber-200'
                  }`}>
                    {commitment.status === 'expired' 
                      ? 'Bản cam kết đã hết hạn. Vui lòng upload bản cam kết mới để tiếp tục đăng ký lớp học.' 
                      : 'Bản cam kết sắp hết hạn. Vui lòng chuẩn bị bản cam kết mới.'}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                Xem bản cam kết
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

