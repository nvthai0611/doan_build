import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Download, AlertCircle } from 'lucide-react';
import { useToast } from '../../../../../hooks/use-toast';
import { parentCommitmentsService } from '../../../../../services/parent/commitments/commitments.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { parentStudentsService } from '../../../../../services/parent/students/students.service';
import { publicClassesService } from '../../../../../services/common/public-classes.service';

interface UploadCommitmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId?: string; // Optional: nếu có thì pre-select student này
  preSelectedSubjectIds?: string[]; // Optional: pre-select các môn học
  onUploadSuccess?: (commitmentId: string) => void; // Callback sau khi upload thành công
}

// Link mẫu form cam kết học tập
const COMMITMENT_FORM_URL = 'https://res.cloudinary.com/dgqkmqkdz/raw/upload/v1761971845/ban-cam-ket-cua-hoc-sinh-so-2_1603112518_wtpcg3.docx';

export const UploadCommitmentDialog = ({ 
  open, 
  onOpenChange, 
  studentId: initialStudentId,
  preSelectedSubjectIds = [],
  onUploadSuccess
}: UploadCommitmentDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId || '');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(preSelectedSubjectIds);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [contractPreviewUrl, setContractPreviewUrl] = useState<string>('');
  const [contractMimeType, setContractMimeType] = useState<string>('');
  const [note, setNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Fetch danh sách con
  const { data: studentsResponse } = useQuery({
    queryKey: ['parent', 'students'],
    queryFn: () => parentStudentsService.getChildren(),
    enabled: open,
  });
  const students = studentsResponse?.data || [];

  // Fetch danh sách môn học
  const { data: subjectsResponse } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => publicClassesService.getSubjects(),
    enabled: open,
  });
  const subjects = subjectsResponse?.data || [];

    // Reset form khi đóng dialog
  useEffect(() => {
    if (!open) {
      setSelectedStudentId(initialStudentId || '');
      setSelectedSubjectIds(preSelectedSubjectIds || []);
      setContractFile(null);
      if (contractPreviewUrl) URL.revokeObjectURL(contractPreviewUrl);
      setContractPreviewUrl('');
      setContractMimeType('');
      setNote('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Update selectedSubjectIds khi dialog mở và có preSelectedSubjectIds
  useEffect(() => {
    if (open && preSelectedSubjectIds && preSelectedSubjectIds.length > 0) {
      setSelectedSubjectIds(preSelectedSubjectIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Pre-select student nếu có initialStudentId khi dialog mở
  useEffect(() => {
    if (open && initialStudentId) {
      setSelectedStudentId(initialStudentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "File quá lớn. Vui lòng chọn file nhỏ hơn 5MB",
          variant: "destructive",
        });
        return;
      }
      setContractFile(file);
      setContractMimeType(file.type || '');
      try {
        const url = URL.createObjectURL(file);
        setContractPreviewUrl(url);
      } catch (_) {
        setContractPreviewUrl('');
      }
    }
  };

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjectIds(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleUpload = async () => {
    // Validation
    if (!selectedStudentId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn học sinh",
        variant: "destructive",
      });
      return;
    }

    if (selectedSubjectIds.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một môn học",
        variant: "destructive",
      });
      return;
    }

    if (!contractFile) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file hợp đồng",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const response = await parentCommitmentsService.uploadCommitment({
        studentId: selectedStudentId,
        file: contractFile,
        subjectIds: selectedSubjectIds,
        note: note || undefined,
      });

      const newCommitmentId = response.data.id;

      toast({
        title: "Thành công",
        description: "Đã upload hợp đồng cam kết thành công",
      });

      // Invalidate queries để refresh danh sách
      queryClient.invalidateQueries({ queryKey: ['commitments', selectedStudentId] });
      queryClient.invalidateQueries({ queryKey: ['commitments'] });

      // Call callback nếu có
      if (onUploadSuccess) {
        onUploadSuccess(newCommitmentId);
      }

      // Đóng dialog
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể upload hợp đồng. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload hợp đồng cam kết mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Chọn học sinh */}
          <div>
            <Label className="text-sm font-medium">
              Chọn học sinh <span className="text-red-500">*</span>
            </Label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full mt-2 px-3 py-2 border rounded-md bg-background"
              disabled={!!initialStudentId}
            >
              <option value="">-- Chọn học sinh --</option>
              {students.map((student: any) => (
                <option key={student.id} value={student.id}>
                  {student.user?.fullName || student.user?.username || 'N/A'}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn môn học */}
          <div>
            <Label className="text-sm font-medium">
              Chọn môn học <span className="text-red-500">*</span>
            </Label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
              {subjects.map((subject: any) => (
                <label
                  key={subject.id}
                  className="flex items-center space-x-2 p-2 border rounded-md cursor-pointer hover:bg-muted transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedSubjectIds.includes(subject.id)}
                    onChange={() => handleSubjectToggle(subject.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{subject.name}</span>
                </label>
              ))}
            </div>
            {selectedSubjectIds.length === 0 && (
              <p className="text-xs text-red-500 mt-1">Vui lòng chọn ít nhất một môn học</p>
            )}
          </div>

          {/* Upload file */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">
                File hợp đồng cam kết <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-primary"
                onClick={() => {
                  window.open(COMMITMENT_FORM_URL, '_blank');
                }}
              >
                <Download className="w-4 h-4 mr-1" />
                Tải mẫu cam kết
              </Button>
            </div>
            
            {!contractFile ? (
              <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="contract-upload"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
                <label
                  htmlFor="contract-upload"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Click để upload hợp đồng
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hỗ trợ: JPG, PNG, PDF (tối đa 5MB)
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {contractFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(contractFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {contractPreviewUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = contractPreviewUrl;
                          a.target = '_blank';
                          a.rel = 'noopener noreferrer';
                          a.click();
                        }}
                      >
                        Xem file
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setContractFile(null);
                        if (contractPreviewUrl) URL.revokeObjectURL(contractPreviewUrl);
                        setContractPreviewUrl('');
                        setContractMimeType('');
                      }}
                      disabled={isUploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Preview */}
                {contractPreviewUrl && contractMimeType.startsWith('image/') && (
                  <div className="border rounded-lg p-2">
                    <img
                      src={contractPreviewUrl}
                      alt="Xem trước hợp đồng"
                      className="max-h-64 w-full object-contain rounded"
                    />
                  </div>
                )}
              </div>
            )}
            {!contractFile && (
              <p className="text-xs text-red-500 mt-1">Vui lòng chọn file hợp đồng</p>
            )}
          </div>

          {/* Ghi chú */}
          <div>
            <Label className="text-sm font-medium">Ghi chú (tùy chọn)</Label>
            <Textarea
              value={note}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
              placeholder="Nhập ghi chú về hợp đồng này..."
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Thông tin */}
          <div className="p-3 border border-blue-300 rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1 text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Hợp đồng sẽ có hiệu lực đến 31/05 năm sau</li>
                  <li>Hợp đồng có thể được sử dụng cho nhiều lớp học khác môn</li>
                  <li>Bạn có thể upload hợp đồng mới bất cứ lúc nào</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !selectedStudentId || !contractFile || selectedSubjectIds.length === 0}
          >
            {isUploading ? 'Đang upload...' : 'Upload hợp đồng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

