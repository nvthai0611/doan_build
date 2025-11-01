import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../../../services/center-owner/settings-management/settings.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { DataTable, Column, PaginationConfig } from '../../../components/common/Table/DataTable';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import LoadingPage from '../../../components/Loading/LoadingPage';

interface ExamType {
  name: string;
  maxScore: number;
  description?: string;
  isActive?: boolean;
}

export function ScoreSetting() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['settings', { group: 'academic' }],
    queryFn: () => settingsService.getAll({ group: 'academic' }),
    refetchOnWindowFocus: false,
  });

  const examTypesData = (data as any[] || []).find((s: any) => s.key === 'exam_types')?.value ?? [];

  const [examTypes, setExamTypes] = useState<ExamType[]>(examTypesData.items || []);
  const [newExamType, setNewExamType] = useState<ExamType>({ name: '', maxScore: 10, description: '', isActive: false });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<ExamType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterdExamTypes, setFilterdExamTypes] = useState<ExamType[]>([]);

  // Đồng bộ state khi dữ liệu fetch về
  useEffect(() => {
    setExamTypes(examTypesData.items || []);
    setFilterdExamTypes(examTypesData.items || []);
  }, [JSON.stringify(examTypesData)]);

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      settingsService.upsert({
        key: 'exam_types',
        group: 'academic',
        value: payload,
        description: 'Exam types configuration',
      }),
    onSuccess: () => {
      toast.success('Đã lưu cấu hình', {duration: 2500});
      qc.invalidateQueries({ queryKey: ['system_settings'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Lỗi lưu cấu hình', {duration: 2500});
    }
  });

  const saveToDatabase = (items: ExamType[]) => {
    mutation.mutate({ items });
    setFilterdExamTypes(items);
  };

  const addExamType = () => {
    if (newExamType.name.trim()) {
      const updated = [...examTypes, { ...newExamType }];
      setExamTypes(updated);
      saveToDatabase(updated);
      setNewExamType({ name: '', maxScore: 10, description: '', isActive: false });
      setIsModalOpen(false);
    }
  };

  const updateExamType = (index: number, field: keyof ExamType, value: string | number | boolean) => {
    const updated = [...examTypes];
    updated[index] = { ...updated[index], [field]: value };
    setExamTypes(updated);
    saveToDatabase(updated);
  };

  const deleteExamType = (index: number) => {
    const updated = examTypes.filter((_, i) => i !== index);
    setExamTypes(updated);
    saveToDatabase(updated);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingItem({ ...examTypes[index] });
  };

  const finishEdit = () => {
    setEditingIndex(null);
    setEditingItem(null);
  };

  const saveEdit = (index: number) => {
    if (editingItem) {
      const updated = [...examTypes];
      updated[index] = { ...editingItem };
      setExamTypes(updated);
      saveToDatabase(updated);
      setEditingIndex(null);
      setEditingItem(null);
    }
  };

  const updateEditingItem = (field: keyof ExamType, value: string | number | boolean) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, [field]: value });
    }
  };

  const toggleActive = (index: number) => {
    updateExamType(index, 'isActive', !examTypes[index].isActive);
  };

  const onPageChangeAction = (page: number) => {
    setCurrentPage(page);
    setFilterdExamTypes(examTypes.slice((page - 1) * itemsPerPage, page * itemsPerPage));
  };
  const onItemsPerPageChangeAction = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setFilterdExamTypes(examTypes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage));
    setCurrentPage(1);
  };

  useEffect(() => {
    setFilterdExamTypes(examTypes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage));
  }, [filterdExamTypes]);

  // Filter logic
  const filteredExamTypes = filterdExamTypes.filter(examType => {
    const matchesSearch = examType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         examType.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && examType.isActive) ||
                         (statusFilter === 'inactive' && !examType.isActive);
    return matchesSearch && matchesStatus;
  });

  // Định nghĩa columns cho DataTable
  const columns: Column<ExamType>[] = [
    {
      key: 'name',
      header: 'Tên loại bài kiểm tra',
      width: '30%',
      searchable: false,
      render: (item: ExamType, index: number) => {
        if (editingIndex === index) {
          return (
            <Input
              value={editingItem?.name || ''}
              onChange={(e) => updateEditingItem('name', e.target.value)}
              className="w-full text-sm"
              placeholder="Tên bài kiểm tra"
            />
          );
        }
        return (
          <div className="font-medium text-gray-900">
            {item.name}
          </div>
        );
      }
    },
    {
      key: 'maxScore',
      header: 'Điểm tối đa',
      width: '15%',
      align: 'center',
      render: (item: ExamType, index: number) => {
        if (editingIndex === index) {
          return (
            <Input
              type="number"
              value={editingItem?.maxScore || 0}
              onChange={(e) => updateEditingItem('maxScore', Number(e.target.value))}
              className="w-full text-sm"
              placeholder="Điểm tối đa"
            />
          );
        }
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
            {item.maxScore} điểm
          </Badge>
        );
      }
    },
    {
      key: 'description',
      header: 'Mô tả',
      width: '25%',
      searchable: false,
      render: (item: ExamType, index: number) => {
        if (editingIndex === index) {
          return (
            <Input
              value={editingItem?.description || ''}
              onChange={(e) => updateEditingItem('description', e.target.value)}
              className="w-full text-sm"
              placeholder="Mô tả"
            />
          );
        }
        return (
          <div className="text-sm text-gray-600">
            {item.description || '-'}
          </div>
        );
      }
    },
    {
      key: 'isActive',
      header: 'Trạng thái',
      width: '15%',
      align: 'center',
      render: (item: ExamType, index: number) => {
        if (editingIndex === index) {
          return (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-gray-600">
                {editingItem?.isActive ? 'Hoạt động' : 'Không hoạt động'}
              </span>
              <Switch
                checked={editingItem?.isActive || false}
                onCheckedChange={(checked) => updateEditingItem('isActive', checked)}
                className="data-[state=checked]:bg-black"
              />
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600">
              {item.isActive ? 'Hoạt động' : 'Không hoạt động'}
            </span>
            <Switch
              checked={item.isActive}
              onCheckedChange={() => toggleActive(index)}
              className="data-[state=checked]:bg-black"
            />
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '15%',
      align: 'center',
      render: (item: ExamType, index: number) => {
        if (editingIndex === index) {
          return (
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={() => saveEdit(index)}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
              >
                Lưu
              </Button>
              <Button
                onClick={() => finishEdit()}
                variant="outline"
                size="sm"
                className="px-3 py-1 text-xs"
              >
                Hủy
              </Button>
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={() => startEdit(index)}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800 p-2"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => deleteExamType(index)}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 p-2"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Cài đặt bài kiểm tra
          </h1>
          <p className="text-gray-600 text-lg">
            Quản lý các bài kiểm tra và điểm số
          </p>
        </div>

        {/* Search, Filter and Add Section */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm bài kiểm tra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-500"
            >
              <option value="all">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm bài kiểm tra
          </Button>
        </div>

        {/* DataTable */}
        <DataTable
          data={filteredExamTypes}
          columns={columns}
          loading={isLoading}
          emptyMessage="Chưa có bài kiểm tra nào"
          className="shadow-sm"
          enableSearch={false}
          enableSort={true}
          hoverable={true}
          striped={true}
          pagination={{
            currentPage: currentPage,
            totalPages: Math.max(1, Math.ceil(examTypes.length / itemsPerPage)),
            totalItems: examTypes.length,
            itemsPerPage: itemsPerPage,
            onPageChange: onPageChangeAction,
            onItemsPerPageChange: onItemsPerPageChangeAction,
            showItemsPerPage: true,
            showPageInfo: true,
          }}
          
        />

        {/* Modal thêm mới loại bài tập */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-black">
                Thêm bài kiểm tra
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Tên bài kiểm tra <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Ví dụ: Kiểm tra đánh giá năng lực"
                  value={newExamType.name}
                  onChange={(e) => setNewExamType({ ...newExamType, name: e.target.value })}
                  className="border-gray-300 focus:border-gray-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Điểm tối đa <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="100"
                  value={newExamType.maxScore}
                  onChange={(e) => setNewExamType({ ...newExamType, maxScore: Number(e.target.value) })}
                  className="border-gray-300 focus:border-gray-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Mô tả (tùy chọn)
                </label>
                <Textarea
                  placeholder="Nhập mô tả cho bài kiểm tra..."
                  value={newExamType.description || ''}
                  onChange={(e) => setNewExamType({ ...newExamType, description: e.target.value })}
                  rows={4}
                  className="border-gray-300 focus:border-gray-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={addExamType}
                  disabled={!newExamType.name.trim()}
                  className="flex-1 bg-black text-white hover:bg-gray-800"
                >
                  Thêm bài kiểm tra
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
