import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { settingsService } from '../../../services/center-owner/settings-management/settings.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '../../../components/common/Table/DataTable';
import { toast } from 'sonner';

type Holiday = {
  id: string;
  startDate: string;
  endDate: string;
  note?: string;
  isActive: boolean;
};

export function HolidaySetting() {
  const [form, setForm] = useState<{ startDate: string; endDate: string; note?: string }>({ startDate: '', endDate: '', note: '' });
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: holidays, isPending: isLoading, refetch } = useQuery({
    queryKey: ['holidays-setting', selectedYear],
    queryFn: () => settingsService.getHolidays(selectedYear),
    refetchOnWindowFocus: false,
  });  

  const items: Holiday[] = useMemo(() => {
    const allItems = (holidays as Holiday[]) || [];
    if (statusFilter === 'all') return allItems;
    return allItems.filter(item => 
      statusFilter === 'active' ? item.isActive : !item.isActive
    );
  }, [holidays, statusFilter]);

  const { mutate: createMut, isPending: creating } = useMutation({
    mutationFn: () => settingsService.createHoliday(form),
    onSuccess: () => {
      toast.success('Đã thêm kỳ nghỉ');
      setForm({ startDate: '', endDate: '', note: '' });
      refetch();
    },
    onError: () => toast.error('Không thể thêm kỳ nghỉ'),
  });

  const { mutate: deleteMut } = useMutation({
    mutationFn: (id: string) => settingsService.deleteHoliday(id),
    onSuccess: () => {
      toast.success('Xóa kỳ nghỉ thành công');
      refetch();
    },
    onError: () => toast.error('Không thể xóa'),
  });

  const { mutate: applyMut, isPending: applying } = useMutation({
    mutationFn: (id: string) => settingsService.applyHoliday(id),
    onSuccess: () => {
      toast.success('Đã liên kết buổi học với kỳ nghỉ');
      refetch();
    },
    onError: () => toast.error('Không thể áp dụng'),
  });

  const columns: Column<Holiday>[] = [
    {
      key: 'startDate',
      header: 'Từ ngày',
      sortable: true,
      render: (item: Holiday) => new Date(item.startDate).toLocaleDateString('vi-VN'),
    },
    {
      key: 'endDate',
      header: 'Đến ngày',
      sortable: true,
      render: (item: Holiday) => new Date(item.endDate).toLocaleDateString('vi-VN'),
    },
    {
      key: 'note',
      header: 'Ghi chú',
      searchable: true,
      render: (item: Holiday) => item.note || '-',
    },
    {
      key: 'isActive',
      header: 'Trạng thái',
      render: (item: Holiday) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {item.isActive ? 'Đang hiệu lực' : 'Không hiệu lực'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (item: Holiday) => (
        <div className="flex gap-2 justify-end">
          <Button 
            variant="secondary" 
            size="sm"
            disabled={applying} 
            onClick={() => applyMut(item.id)}
          >
            Áp dụng
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => deleteMut(item.id)}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form thêm kỳ nghỉ - Bên trái */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Thêm Kỳ Nghỉ Mới</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Ngày bắt đầu</label>
                  <Input 
                    type="date" 
                    value={form.startDate} 
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} 
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Ngày kết thúc</label>
                  <Input 
                    type="date" 
                    value={form.endDate} 
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} 
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Ghi chú</label>
                  <textarea 
                    placeholder="Nhập ghi chú về kỳ nghỉ này..."
                    value={form.note} 
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    disabled={creating || !form.startDate || !form.endDate} 
                    onClick={() => createMut()}
                    className="flex-1"
                  >
                    Thêm
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setForm({ startDate: '', endDate: '', note: '' })}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table danh sách - Bên phải */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách kỳ nghỉ</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filter controls */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Năm</label>
                  <Input 
                    type="number" 
                    value={selectedYear} 
                    onChange={e => setSelectedYear(e.target.value)}
                    placeholder="Năm"
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium">Trạng thái</label>
                  <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">Tất cả</option>
                    <option value="active">Đang hiệu lực</option>
                    <option value="inactive">Không hiệu lực</option>
                  </select>
                </div>
              </div>

              <DataTable
                data={items}
                columns={columns}
                loading={isLoading}
                emptyMessage="Chưa có dữ liệu"
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
