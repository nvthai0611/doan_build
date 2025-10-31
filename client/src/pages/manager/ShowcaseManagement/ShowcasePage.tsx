import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showcaseService, type Showcase, type CreateShowcaseRequest, type UpdateShowcaseRequest } from '../../../services/center-owner/showcase-management/showcase.service';
import { publicClassesService } from '../../../services/common/public-classes.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, Column } from '../../../components/common/Table/DataTable';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Star, Image as ImageIcon, Upload, X } from 'lucide-react';
import LoadingPage from '../../../components/Loading/LoadingPage';
import { Label } from '@/components/ui/label';

export const ShowcasesPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'not-featured'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShowcase, setEditingShowcase] = useState<Showcase | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateShowcaseRequest>({
    title: '',
    description: '',
    studentImage: '',
    achievement: '',
    featured: false,
    order: 0,
  });

  const [subjectId, setSubjectId] = useState<string>('');
  const [achievementDetail, setAchievementDetail] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch subjects
  const { data: subjectsData } = useQuery({
    queryKey: ['public-subjects'],
    queryFn: () => publicClassesService.getSubjects(),
  });

  const subjects = subjectsData?.data || [];

  // Fetch showcases
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['showcases', currentPage, itemsPerPage, featuredFilter, searchTerm],
    queryFn: () =>
      showcaseService.getShowcases({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        featured: featuredFilter === 'featured' ? true : featuredFilter === 'not-featured' ? false : undefined,
      }),
    refetchOnWindowFocus: false,
  });

  const showcases = data?.data || [];
  const meta = data?.meta;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateShowcaseRequest) => showcaseService.createShowcase(data),
    onSuccess: () => {
      toast.success('Tạo học sinh tiêu biểu thành công', { duration: 2500 });
      queryClient.invalidateQueries({ queryKey: ['showcases'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Lỗi khi tạo học sinh tiêu biểu', { duration: 2500 });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShowcaseRequest }) =>
      showcaseService.updateShowcase(id, data),
    onSuccess: () => {
      toast.success('Cập nhật học sinh tiêu biểu thành công', { duration: 2500 });
      queryClient.invalidateQueries({ queryKey: ['showcases'] });
      setEditingShowcase(null);
      resetForm();
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Lỗi khi cập nhật học sinh tiêu biểu', { duration: 2500 });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => showcaseService.deleteShowcase(id),
    onSuccess: () => {
      toast.success('Xóa học sinh tiêu biểu thành công', { duration: 2500 });
      queryClient.invalidateQueries({ queryKey: ['showcases'] });
      setDeleteConfirmId(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Lỗi khi xóa học sinh tiêu biểu', { duration: 2500 });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      studentImage: '',
      achievement: '',
      featured: false,
      order: 0,
    });
    setSubjectId('');
    setAchievementDetail('');
    setImageFile(null);
    setImagePreview('');
    setEditingShowcase(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh', { duration: 2500 });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB', { duration: 2500 });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, studentImage: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (showcase: Showcase) => {
    setEditingShowcase(showcase);
    setFormData({
      title: showcase.title,
      description: showcase.description || '',
      studentImage: showcase.studentImage,
      achievement: showcase.achievement,
      featured: showcase.featured,
      order: showcase.order,
    });
    
    // Parse achievement to get subject and detail
    const achievementParts = showcase.achievement.split(' — ');
    if (achievementParts.length === 2) {
      const subjectName = achievementParts[0].trim();
      const subject = subjects.find((s: any) => s.name === subjectName);
      if (subject) {
        setSubjectId(subject.id);
        setAchievementDetail(achievementParts[1].trim());
      } else {
        setSubjectId('');
        setAchievementDetail(showcase.achievement);
      }
    } else {
      setSubjectId('');
      setAchievementDetail(showcase.achievement);
    }
    
    setImagePreview(showcase.studentImage);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tên học sinh', { duration: 2500 });
      return;
    }
    
    // Validate image - must have file for create, optional for update
    if (!editingShowcase && !imageFile) {
      toast.error('Vui lòng chọn ảnh học sinh', { duration: 2500 });
      return;
    }

    // Build achievement from subject and detail
    let achievement = '';
    if (subjectId && achievementDetail.trim()) {
      const subject = subjects.find((s: any) => s.id === subjectId);
      achievement = subject ? `${subject.name} — ${achievementDetail.trim()}` : achievementDetail.trim();
    } else if (achievementDetail.trim()) {
      achievement = achievementDetail.trim();
    } else {
      toast.error('Vui lòng chọn môn học và nhập thành tích', { duration: 2500 });
      return;
    }

    // Build submit data
    const submitData: CreateShowcaseRequest | UpdateShowcaseRequest = {
      ...formData,
      achievement,
    };

    // Only send studentImage if it's a new file (for create or update)
    // For update: only send if new file is selected, otherwise backend keeps old image
    if (editingShowcase) {
      const updateData: UpdateShowcaseRequest = {
        ...submitData,
      };
      // Only include studentImage if it's a new file
      if (imageFile) {
        updateData.studentImage = imageFile;
      }
      updateMutation.mutate({ id: editingShowcase.id, data: updateData });
    } else {
      // For create, must have image file (already validated above)
      const createData: CreateShowcaseRequest = {
        ...submitData,
        studentImage: imageFile!, // Must be File for create
      } as CreateShowcaseRequest;
      createMutation.mutate(createData);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  // Columns definition
  const columns: Column<Showcase>[] = [
    {
      key: 'studentImage',
      header: 'Ảnh',
      width: '15%',
      render: (item: Showcase) => (
        <div className="flex items-center justify-center">
          <img
            src={item.studentImage}
            alt={item.title}
            className="w-16 h-16 object-cover rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Image';
            }}
          />
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Tên học sinh',
      width: '15%',
      searchable: true,
      render: (item: Showcase) => (
        <div className="font-medium text-gray-900">{item.title}</div>
      ),
    },
    {
      key: 'achievement',
      header: 'Thành tích',
      width: '20%',
      searchable: true,
      render: (item: Showcase) => (
        <div className="text-sm text-gray-600 text-pretty max-w-[200px] truncate line-clamp-2">{item.achievement}</div>
      ),
    },
    {
      key: 'description',
      header: 'Mô tả',
      width: '25%',
      searchable: true,
      render: (item: Showcase) => (
        <div className="text-sm text-gray-600 text-pretty max-w-[200px] truncate line-clamp-2">
          {item.description || '-'}
        </div>
      ),
    },
    {
      key: 'featured',
      header: 'Nổi bật',
      width: '10%',
      align: 'center',
      render: (item: Showcase) => (
        <div className="flex items-center justify-center">
          {item.featured ? (
            <Badge className="bg-yellow-400 text-black">
              <Star className="w-3 h-3 mr-1" />
              Nổi bật
            </Badge>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'order',
      header: 'Thứ tự',
      width: '8%',
      align: 'center',
      render: (item: Showcase) => (
        <div className="text-sm font-medium text-gray-700">{item.order}</div>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '12%',
      align: 'center',
      render: (item: Showcase) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => handleOpenEditModal(item)}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800 p-2"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setDeleteConfirmId(item.id)}
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 p-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Quản lý Học sinh Tiêu biểu
          </h1>
          <p className="text-gray-600 text-lg">
            Quản lý danh sách học sinh tiêu biểu và xuất sắc hiển thị trên trang chủ
          </p>
        </div>

        {/* Search, Filter and Add Section */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm theo tên, thành tích, mô tả..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={featuredFilter}
              onChange={(e) => {
                setFeaturedFilter(e.target.value as 'all' | 'featured' | 'not-featured');
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-500"
            >
              <option value="all">Tất cả</option>
              <option value="featured">Nổi bật</option>
              <option value="not-featured">Không nổi bật</option>
            </select>
          </div>
          <Button
            onClick={handleOpenCreateModal}
            className="bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm học sinh tiêu biểu
          </Button>
        </div>

        {/* DataTable */}
        <DataTable
          data={showcases}
          columns={columns}
          loading={isLoading}
          emptyMessage="Chưa có học sinh tiêu biểu nào"
          className="shadow-sm"
          enableSearch={false}
          enableSort={true}
          hoverable={true}
          striped={true}
          pagination={
            meta
              ? {
                  currentPage: meta.page,
                  totalPages: meta.totalPages,
                  totalItems: meta.total,
                  itemsPerPage: meta.limit,
                  onPageChange: (page) => setCurrentPage(page),
                  onItemsPerPageChange: (limit) => {
                    setItemsPerPage(limit);
                    setCurrentPage(1);
                  },
                  showItemsPerPage: true,
                  showPageInfo: true,
                }
              : undefined
          }
        />

        {/* Create/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-black">
                {editingShowcase ? 'Chỉnh sửa học sinh tiêu biểu' : 'Thêm học sinh tiêu biểu mới'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-black">
                  Tên học sinh <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Ví dụ: Nguyễn Minh Huy"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border-gray-300 focus:border-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-black">
                  Ảnh học sinh <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-3">
                  {imagePreview ? (
                    <div>
                        <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-48 h-48 object-cover rounded-lg border-2 border-gray-300 hover:opacity-90 transition-opacity"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/192?text=Invalid';
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        Nhấp để chọn ảnh hoặc kéo thả vào đây
                      </p>
                      <p className="text-xs text-gray-400">
                        PNG, JPG, WEBP tối đa 5MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {!imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Chọn ảnh
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-black">
                  Thành tích <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Môn học</Label>
                    <Select value={subjectId} onValueChange={setSubjectId}>
                      <SelectTrigger className="border-gray-300 focus:border-gray-500">
                        <SelectValue placeholder="Chọn môn học" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject: any) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Chi tiết thành tích</Label>
                    <Input
                      placeholder="Ví dụ: Giải Nhất Quốc Tế IMO 2024"
                      value={achievementDetail}
                      onChange={(e) => setAchievementDetail(e.target.value)}
                      className="border-gray-300 focus:border-gray-500"
                    />
                  </div>
                </div>
                {subjectId && achievementDetail && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Thành tích sẽ hiển thị:</p>
                    <p className="text-sm font-medium text-gray-900">
                      {subjects.find((s: any) => s.id === subjectId)?.name} — {achievementDetail}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-black">Mô tả hành trình</Label>
                <Textarea
                  placeholder="Mô tả hành trình của học sinh..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-gray-300 focus:border-gray-500 min-h-[100px]"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-black">Thứ tự hiển thị</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="border-gray-300 focus:border-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-black">Trạng thái nổi bật</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                      className="data-[state=checked]:bg-yellow-400"
                    />
                    <span className="text-sm text-gray-600">
                      {formData.featured ? 'Nổi bật' : 'Không nổi bật'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang xử lý...
                </div>
                    : editingShowcase
                      ? 'Cập nhật'
                      : 'Tạo mới'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-black">
                Xác nhận xóa
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Bạn có chắc chắn muốn xóa học sinh tiêu biểu này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmId(null)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ShowcasesPage;
