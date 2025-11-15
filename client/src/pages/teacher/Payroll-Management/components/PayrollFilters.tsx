import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X, Calendar } from 'lucide-react';

interface PayrollFiltersProps {
  filters: any;
  onFilterChange: (filters: Partial<any>) => void;
}

export default function PayrollFilters({ filters, onFilterChange }: PayrollFiltersProps) {
  const handleClearFilters = () => {
    onFilterChange({
      month: '',
      status: '',
    });
  };

  const hasActiveFilters = filters.month || filters.status;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Month Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tháng</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
            <Input
              type="month"
              value={filters.month}
              onChange={(e) => onFilterChange({ month: e.target.value })}
              className="pl-10"
              max={new Date().toISOString().slice(0, 7)}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange({ status: value === 'all' ? '' : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="waiting_teacher_approval">Chờ xác nhận</SelectItem>
              <SelectItem value="approved_by_teacher">Đã duyệt</SelectItem>
              <SelectItem value="rejected_by_teacher">Từ chối</SelectItem>
              <SelectItem value="paid">Đã thanh toán</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Button */}
        <div className="flex items-end">
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClearFilters} className="w-full gap-2">
              <X className="w-4 h-4" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
