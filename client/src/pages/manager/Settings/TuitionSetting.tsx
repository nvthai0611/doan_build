import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, Column } from '../../../components/common/Table/DataTable';
import { financialManagementService } from '../../../services/center-owner/financial-management/financial-management.service';
import { 
  Grade, 
  Subject, 
  FeeStructure, 
  UpsertSessionFeeRequest 
} from '../../../types/tuition.types';
import { toast } from 'sonner';
import { Plus, RefreshCw, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import LoadingPage from '../../../components/Loading/LoadingPage';

export function TuitionSetting() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFees, setFilteredFees] = useState<FeeStructure[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeStructure | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  // Filter states
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    gradeId: '',
    subjectId: '',
    amount: 0,
    period: 'per_session',
    description: ''
  });

  // Fetch session fee structures
  const { data: feesData, isLoading, error, refetch } = useQuery({
    queryKey: ['session-fee-structures'],
    queryFn: () => financialManagementService.getSessionFeeStructures(),
    refetchOnWindowFocus: false,
  });

  // Fetch grades
  const { data: gradesData } = useQuery({
    queryKey: ['grades'],
    queryFn: () => financialManagementService.getGrades(),
    refetchOnWindowFocus: false,
  });

  // Fetch subjects
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => financialManagementService.getSubjects(),
    refetchOnWindowFocus: false,
  });

  // Upsert session fee mutation
  const upsertFeeMutation = useMutation({
    mutationFn: (data: UpsertSessionFeeRequest) => 
      financialManagementService.upsertSessionFee(data),
    onSuccess: () => {
      toast.success('Lưu học phí thành công');
      queryClient.invalidateQueries({ queryKey: ['session-fee-structures'] });
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi lưu học phí');
    }
  });

  // Delete session fee mutation
  const deleteFeeMutation = useMutation({
    mutationFn: (id: string) => financialManagementService.deleteSessionFee(id),
    onSuccess: () => {
      toast.success('Xóa học phí thành công');
      queryClient.invalidateQueries({ queryKey: ['session-fee-structures'] });
      setIsDeleteModalOpen(false);
      setSelectedFee(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi xóa học phí');
    }
  });

  // Filter and sort fees
  useEffect(() => {
    console.log(feesData);
    if (feesData) {
      let filtered = (feesData as any).filter((fee: FeeStructure) => {
        // Search filter
        const nameMatch = fee.name.toLowerCase().includes(searchTerm.toLowerCase());
        const gradeMatch = fee.grade?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const subjectMatch = fee.subject?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const searchMatch = nameMatch || gradeMatch || subjectMatch;
        
        // Grade filter
        const gradeFilterMatch = gradeFilter === 'all' || fee.gradeId === gradeFilter;
        
        // Subject filter
        const subjectFilterMatch = subjectFilter === 'all' || fee.subjectId === subjectFilter;
        
        // Status filter
        const statusFilterMatch = statusFilter === 'all' || 
          (statusFilter === 'active' && fee.isActive) ||
          (statusFilter === 'inactive' && !fee.isActive);
        
        return searchMatch && gradeFilterMatch && subjectFilterMatch && statusFilterMatch;
      });

      // Sort data
      if (sortBy && sortOrder) {
        filtered = filtered.sort((a: FeeStructure, b: FeeStructure) => {
          let aValue: any;
          let bValue: any;

          switch (sortBy) {
            case 'name':
              aValue = a.name;
              bValue = b.name;
              break;
            case 'grade':
              aValue = a.grade?.name || '';
              bValue = b.grade?.name || '';
              break;
            case 'subject':
              aValue = a.subject?.name || '';
              bValue = b.subject?.name || '';
              break;
            case 'amount':
              aValue = a.amount;
              bValue = b.amount;
              break;
            case 'period':
              aValue = a.period;
              bValue = b.period;
              break;
            case 'status':
              aValue = a.isActive ? 1 : 0;
              bValue = b.isActive ? 1 : 0;
              break;
            default:
              return 0;
          }

          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
          }
        });
      }

      setFilteredFees(filtered);
      setPage(1); // Reset to first page when filters change
    } else {
      setFilteredFees([]);
    }
  }, [feesData, searchTerm, gradeFilter, subjectFilter, statusFilter, sortBy, sortOrder]);

  const resetForm = () => {
    setFormData({
      name: '',
      gradeId: '',
      subjectId: '',
      amount: 0,
      period: 'per_session',
      description: ''
    });
  };

  const handleAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleEdit = (fee: FeeStructure) => {
    setSelectedFee(fee);
    setFormData({
      name: fee.name,
      gradeId: fee.gradeId || '',
      subjectId: fee.subjectId || '',
      amount: fee.amount,
      period: fee.period,
      description: fee.description || ''
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (fee: FeeStructure) => {
    setSelectedFee(fee);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.gradeId || !formData.subjectId || formData.amount <= 0) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    await upsertFeeMutation.mutateAsync({
      gradeId: formData.gradeId,
      subjectId: formData.subjectId,
      amount: formData.amount
    });
  };

  const handleConfirmDelete = async () => {
    if (selectedFee) {
      await deleteFeeMutation.mutateAsync(selectedFee.id);
    }
  };

  // Define columns for the fees table
  const columns: Column<FeeStructure>[] = [
    {
      key: 'name',
      header: 'Tên học phí',
      width: '25%',
      sortable: true,
      render: (fee: FeeStructure) => (
        <div className="font-medium text-gray-900">{fee.name}</div>
      )
    },
    {
      key: 'grade',
      header: 'Khối',
      width: '15%',
      sortable: true,
      render: (fee: FeeStructure) => (
        <div className="text-sm text-gray-600">{fee.grade?.name || '-'}</div>
      )
    },
    {
      key: 'subject',
      header: 'Môn học',
      width: '15%',
      sortable: true,
      render: (fee: FeeStructure) => (
        <div className="text-sm text-gray-600">{fee.subject?.name || '-'}</div>
      )
    },
    {
      key: 'amount',
      header: 'Số tiền',
      width: '15%',
      align: 'right',
      sortable: true,
      render: (fee: FeeStructure) => (
        <div className="font-medium text-gray-900">
          {fee.amount.toLocaleString()} ₫
        </div>
      )
    },
    {
      key: 'period',
      header: 'Kỳ hạn',
      width: '15%',
      sortable: true,
      render: (fee: FeeStructure) => (
        <div className="text-sm text-gray-600">
          {fee.period === 'per_session' ? 'Mỗi buổi' : fee.period}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '10%',
      sortable: true,
      render: (fee: FeeStructure) => (
        <Badge 
          variant={fee.isActive ? 'default' : 'secondary'}
          className={fee.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
        >
          {fee.isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Hành động',
      width: '5%',
      align: 'center',
      render: (fee: FeeStructure) => (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(fee)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(fee)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Lỗi khi tải dữ liệu</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Cài đặt học phí
          </h1>
          <p className="text-gray-600 text-lg">
            Quản lý học phí theo môn học và khối lớp
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-black text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" />
          Thêm mới
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div>
          <Input
            placeholder="Tìm kiếm môn học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Grade Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Lọc theo khối</label>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn khối lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khối</SelectItem>
                {((gradesData as any) ?? []).map((grade: Grade) => (
                  <SelectItem key={grade.id} value={grade.id}>
                    {grade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Subject Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Lọc theo môn học</label>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn môn học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả môn</SelectItem>
                {((subjectsData as any) ?? []).map((subject: Subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Lọc theo trạng thái</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Clear Filters */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {searchTerm && `Tìm kiếm: "${searchTerm}"`}
            {gradeFilter !== 'all' && ` • Khối: ${((gradesData as any) ?? []).find((g: Grade) => g.id === gradeFilter)?.name || 'N/A'}`}
            {subjectFilter !== 'all' && ` • Môn: ${((subjectsData as any) ?? []).find((s: Subject) => s.id === subjectFilter)?.name || 'N/A'}`}
            {statusFilter !== 'all' && ` • Trạng thái: ${statusFilter === 'active' ? 'Hoạt động' : 'Không hoạt động'}`}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setGradeFilter('all');
              setSubjectFilter('all');
              setStatusFilter('all');
            }}
            className="text-gray-600"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Fees Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Danh sách học phí</CardTitle>
              <p className="text-sm text-gray-600">
                Xem và quản lý tất cả cấu trúc học phí
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Hiển thị {Math.min((page - 1) * pageSize + 1, filteredFees.length)}-{Math.min(page * pageSize, filteredFees.length)} / {filteredFees.length} kết quả
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredFees.slice((page - 1) * pageSize, page * pageSize)}
            columns={columns}
            loading={isLoading}
            emptyMessage="Không có dữ liệu"
            className="min-w-full"
            pagination={{
              currentPage: page,
              totalPages: Math.ceil(filteredFees.length / pageSize),
              totalItems: filteredFees.length,
              itemsPerPage: pageSize,
              onPageChange: setPage,
              onItemsPerPageChange: setPageSize,
              showItemsPerPage: true,
              showPageInfo: true
            }}
            onSortChange={(sortBy, sortOrder) => {
              setSortBy(sortBy);
              setSortOrder(sortOrder);
            }}
            enableSearch={true}
            enableSort={true}
            hoverable={true}
            striped={true}
            rowKey="id"
            onRowClick={(fee) => {
              // Optional: Add row click handler
              console.log('Row clicked:', fee);
            }}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isAddModalOpen ? 'Thêm học phí mới' : 'Chỉnh sửa học phí'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Khối lớp *</label>
              <Select value={formData.gradeId} onValueChange={(value) => setFormData({...formData, gradeId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khối lớp" />
                </SelectTrigger>
                <SelectContent>
                  {((gradesData as any) ?? []).map((grade: Grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Môn học *</label>
              <Select value={formData.subjectId} onValueChange={(value) => setFormData({...formData, subjectId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {((subjectsData as any) ?? []).map((subject: Subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Số tiền (VND) *</label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                placeholder="Nhập số tiền"
                min="0"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Mô tả</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Nhập mô tả (tùy chọn)"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                resetForm();
              }} className="flex-1">
                Hủy
              </Button>
              <Button type="submit" disabled={upsertFeeMutation.isPending} className="flex-1">
                {upsertFeeMutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Bạn có chắc chắn muốn xóa học phí <strong>{selectedFee?.name}</strong>?
            </p>
            <p className="text-sm text-red-600">
              Hành động này không thể hoàn tác.
            </p>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button 
                onClick={handleConfirmDelete}
                disabled={deleteFeeMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {deleteFeeMutation.isPending ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}