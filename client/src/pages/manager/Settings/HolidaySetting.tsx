import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { settingsService } from '../../../services/center-owner/settings-management/settings.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DataTable, Column } from '../../../components/common/Table/DataTable';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  Calendar,
  Plus,
  RefreshCw,
  Filter,
  Search,
  Settings,
  Trash2,
  CheckCircle,
  XCircle,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Holiday = {
  id: string;
  startDate: string;
  endDate: string;
  note?: string;
  isActive: boolean;
};

export function HolidaySetting() {
  const [form, setForm] = useState<{ startDate: string; endDate: string; type: string; note?: string }>({ startDate: '', endDate: '', type: '', note: '' });
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  // Validation functions
  const validateForm = (formData: typeof form) => {
    const newErrors: { [key: string]: string } = {};

    // Validate type
    if (!formData.type) {
      newErrors.type = 'Vui lòng chọn loại kỳ nghỉ';
    }

    // Validate start date
    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu không được để trống';
    } else {
      // Validate LocalDate format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.startDate)) {
        newErrors.startDate = 'Định dạng ngày phải là YYYY-MM-DD';
      } else {
        const startDate = new Date(formData.startDate + 'T00:00:00.000Z');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (isNaN(startDate.getTime())) {
          newErrors.startDate = 'Ngày bắt đầu không hợp lệ';
        } else if (startDate < today) {
          newErrors.startDate = 'Ngày bắt đầu không được trong quá khứ';
        }
      }
    }

    // Validate end date
    if (!formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc không được để trống';
    } else {
      // Validate LocalDate format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.endDate)) {
        newErrors.endDate = 'Định dạng ngày phải là YYYY-MM-DD';
      } else {
        const endDate = new Date(formData.endDate + 'T00:00:00.000Z');
        
        if (isNaN(endDate.getTime())) {
          newErrors.endDate = 'Ngày kết thúc không hợp lệ';
        } else if (formData.startDate && endDate <= new Date(formData.startDate + 'T00:00:00.000Z')) {
          newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
        }
      }
    }

    // Validate note
    if (formData.note && formData.note.length > 500) {
      newErrors.note = 'Mô tả không được vượt quá 500 ký tự';
    }

    return newErrors;
  };

  // Check for overlapping holidays
  const checkOverlappingHolidays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return false;
    
    const newStart = new Date(startDate + 'T00:00:00.000Z');
    const newEnd = new Date(endDate + 'T00:00:00.000Z');
    
    return (holidays as Holiday[])?.some(holiday => {
      const existingStart = new Date(holiday.startDate);
      const existingEnd = new Date(holiday.endDate);
      
      // Check for overlap using date ranges
      return (
        (newStart >= existingStart && newStart <= existingEnd) ||
        (newEnd >= existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd) ||
        (newStart >= existingStart && newEnd <= existingEnd)
      );
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleInputBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate specific field
    const fieldErrors = validateForm({ ...form, [field]: form[field as keyof typeof form] });
    if (fieldErrors[field]) {
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
    }
    
    // Check for overlapping holidays when both dates are filled
    if ((field === 'startDate' || field === 'endDate') && form.startDate && form.endDate) {
      const isOverlapping = checkOverlappingHolidays(form.startDate, form.endDate);
      if (isOverlapping) {
        setErrors(prev => ({ 
          ...prev, 
          startDate: 'Kỳ nghỉ này trùng với kỳ nghỉ đã tồn tại',
          endDate: 'Kỳ nghỉ này trùng với kỳ nghỉ đã tồn tại'
        }));
      }
    }
  };

  const { data: holidays, isPending: isLoading, refetch } = useQuery({
    queryKey: ['holidays-setting', selectedYear],
    queryFn: () => settingsService.getHolidays(selectedYear),
    refetchOnWindowFocus: false,
  });  

  const items: Holiday[] = useMemo(() => {
    const allItems = (holidays as Holiday[]) || [];
    let filteredItems = allItems;
    
    // Filter by status
    if (statusFilter !== 'all') {
      filteredItems = filteredItems.filter(item => 
        statusFilter === 'active' ? item.isActive : !item.isActive
      );
    }
    
    // Filter by search term (description)
    if (searchTerm.trim()) {
      filteredItems = filteredItems.filter(item => 
        item.note?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filteredItems;
  }, [holidays, statusFilter, searchTerm]);

  const { mutate: createMut, isPending: creating } = useMutation({
    mutationFn: async () => {
      // Tạo kỳ nghỉ trước
      const holiday = await settingsService.createHoliday(form);
      
      // Tự động áp dụng ngay sau khi tạo
      await settingsService.applyHoliday((holiday as any).id);
      
      return holiday;
    },
    onSuccess: () => {
      toast.success('Đã tạo và áp dụng kỳ nghỉ thành công');
      setForm({ startDate: '', endDate: '', type: '', note: '' });
      setErrors({});
      setTouched({});
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error: any) => {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể tạo kỳ nghỉ');
      }
    },
  });

  const handleSubmit = () => {
    // Mark all fields as touched
    setTouched({ startDate: true, endDate: true, type: true, note: true });
    
    // Validate form
    const validationErrors = validateForm(form);
    
    // Check for overlapping holidays
    if (form.startDate && form.endDate) {
      const isOverlapping = checkOverlappingHolidays(form.startDate, form.endDate);
      if (isOverlapping) {
        validationErrors.startDate = 'Kỳ nghỉ này trùng với kỳ nghỉ đã tồn tại';
        validationErrors.endDate = 'Kỳ nghỉ này trùng với kỳ nghỉ đã tồn tại';
      }
    }
    
    setErrors(validationErrors);
    
    // If no errors, submit
    if (Object.keys(validationErrors).length === 0) {
      createMut();
    } else {
      toast.error('Vui lòng kiểm tra lại thông tin');
    }
  };

  const { mutate: deleteMut } = useMutation({
    mutationFn: (id: string) => settingsService.deleteHoliday(id),
    onSuccess: () => {
      toast.success('Xóa kỳ nghỉ thành công');
      refetch();
    },
    onError: () => toast.error('Không thể xóa'),
  });

  const handleDeleteHoliday = (id: string) => {
    deleteMut(id);
  };

  const columns: Column<Holiday>[] = [
    {
      key: 'index',
      header: 'STT',
      sortable: false,
      align: 'center',
      render: (_: Holiday, index: number) => (
        <div className="flex items-center justify-center">
          <span className="font-medium">{index + 1}</span>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Từ ngày',
      sortable: true,
      render: (item: Holiday) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">
            {new Date(item.startDate).toLocaleDateString('vi-VN')}
          </span>
        </div>
      ),
    },
    {
      key: 'endDate',
      header: 'Đến ngày',
      sortable: true,
      render: (item: Holiday) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">
            {new Date(item.endDate).toLocaleDateString('vi-VN')}
          </span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Loại',
      sortable: true,
      render: (item: Holiday) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">Nghỉ tết</span>
        </div>
      ),
    },
    {
      key: 'note',
      header: 'Mô tả',
      sortable: true,
      render: (item: Holiday) => (
        <div className="max-w-xs">
          <span className="text-sm text-muted-foreground">
            {item.note || 'Không có Mô tả'}
          </span>
        </div>
      ),
    },
    // {
    //   key: 'isActive',
    //   header: 'Trạng thái',
    //   render: (item: Holiday) => (
    //     <Badge
    //       variant={item.isActive ? "default" : "secondary"}
    //       className={`flex items-center gap-1 w-fit ${
    //         item.isActive
    //           ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
    //           : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200'
    //       }`}
    //     >
    //       {item.isActive ? (
    //         <>
    //           <CheckCircle className="w-3 h-3" />
    //           Đang hiệu lực
    //         </>
    //       ) : (
    //         <>
    //           <XCircle className="w-3 h-3" />
    //           Không hiệu lực
    //         </>
    //       )}
    //     </Badge>
    //   ),
    // },
    {
      key: 'actions',
      header: 'Thao tác',
      sortable: false,
      render: (item: Holiday) => (
        <div className="flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 text-red-600 focus:text-red-600"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 className="w-4 h-4" />
                Xóa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa kỳ nghỉ</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa kỳ nghỉ từ{' '}
                  {new Date(item.startDate).toLocaleDateString('vi-VN')} đến{' '}
                  {new Date(item.endDate).toLocaleDateString('vi-VN')}?
                  <br />
                  <span className="text-red-600 font-medium">
                    Hành động này không thể hoàn tác.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteHoliday(item.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Quản lý kỳ nghỉ
            </h1>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
              />
              Làm mới
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm kỳ nghỉ
            </Button>
          </div>
        </div>
      </div>

      {/* Modal tạo kỳ nghỉ */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Thêm Kỳ Nghỉ Mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4" />
                Loại kỳ nghỉ <span className="text-red-600">*</span>
              </label>
              <Select
                value={form.type}
                onValueChange={(v) => handleInputChange('type', v)}
              >
                <SelectTrigger className={`${errors.type && touched.type ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                  <SelectValue placeholder="Chọn loại kỳ nghỉ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Nghỉ lễ</SelectItem>
                  <SelectItem value="CENTER">Lịch trung tâm</SelectItem>
                  <SelectItem value="EMERGENCY">Lịch khẩn cấp</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && touched.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                Ngày bắt đầu
                <span className="text-red-600">*</span>
              </label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                onBlur={() => handleInputBlur('startDate')}
                className={`w-full ${
                  errors.startDate && touched.startDate
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : ''
                }`}
              />
              {errors.startDate && touched.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                Ngày kết thúc
                <span className="text-red-600">*</span>
              </label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                onBlur={() => handleInputBlur('endDate')}
                className={`w-full ${
                  errors.endDate && touched.endDate
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : ''
                }`}
              />
              {errors.endDate && touched.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4" />
                Mô tả
                {form.note && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {form.note.length}/500
                  </span>
                )}
                <span className="text-red-600">*</span>
              </label>
              <textarea
                placeholder="Nhập Mô tả về kỳ nghỉ này..."
                value={form.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                onBlur={() => handleInputBlur('note')}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.note && touched.note
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : ''
                }`}
                rows={3}
              />
              {errors.note && touched.note && (
                <p className="mt-1 text-sm text-red-600">{errors.note}</p>
              )}
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              disabled={creating || Object.keys(errors).length > 0}
              onClick={handleSubmit}
              className="flex-1"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setForm({ startDate: '', endDate: '', type: '', note: '' });
                setErrors({});
                setTouched({});
              }}
              className="flex-1"
            >
              Đặt lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-6">
        {/* Table danh sách */}
        <div className="order-1">
          <Card className="shadow-sm border dark:border-gray-700">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Danh sách kỳ nghỉ
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filter controls */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Năm
                    </label>
                    <Input
                      type="number"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      placeholder="Nhập năm..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Tìm kiếm theo mô tả
                    </label>
                    <Input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Nhập từ khóa tìm kiếm..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {/* <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Trạng thái
                    </label>
                    <select 
                      value={statusFilter} 
                      onChange={e => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="active">Có hiệu lực</option>
                      <option value="inactive">Không hiệu lực</option>
                    </select>
                  </div> */}
                </div>
              </div>

              <DataTable
                data={items}
                columns={columns}
                loading={isLoading}
                emptyMessage="Chưa có dữ liệu kỳ nghỉ"
                enableSearch={true}
                enableSort={true}
                hoverable={true}
                striped={true}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
