import { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, ArrowLeft, Check, ChevronLeft, ChevronRight, Users, Mail, Phone, IdCard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '../../../../../hooks/useDebounce';
import { centerOwnerStudentService } from '../../../../../services/center-owner/student-management/student.service';
import Loading from '../../../../../components/Loading/LoadingPage';
import { enrollmentService } from '../../../../../services/center-owner/enrollment/enrollment.service';

interface SelectStudentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData?: any;
  onSubmit?: (selectedIds: string[]) => void;
  isLoading?: boolean;
}

interface StudentItem {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  parent?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
}

export const SelectStudentSheet = ({
  open,
  onOpenChange,
  classData,
  onSubmit,
  isLoading = false
}: SelectStudentSheetProps) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const { data, isLoading: isFetchingStudents } = useQuery({
    queryKey: ['students', { searchTerm: debouncedQuery || undefined, page, limit: pageSize, open }],
    queryFn: () => enrollmentService.getStudentsByClass(classData.id, {
      search: debouncedQuery?.trim() ? debouncedQuery : undefined,
      page: page,
      limit: pageSize
    }),
    enabled: open,
    staleTime: 2000,
    refetchOnWindowFocus: true
  });
  console.log(data);
  

  const apiStudents: any[] = (data as any)?.data || [];
  const total: number = (data as any)?.pagination?.totalCount || apiStudents.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = useMemo(() => apiStudents.map((s: any) => ({
    id: s.id,
    fullName: s.user?.fullName || s.fullName || 'Không tên',
    email: s.user?.email || s.email,
    phone: s.user?.phone || s.phone,
    avatar: s.user?.avatar || s.avatar,
    parent: {
      fullName: s.parent?.user?.fullName || s.parent?.fullName,
      email: s.parent?.user?.email || s.parent?.email,
      phone: s.parent?.user?.phone || s.parent?.phone,
    }
  })), [apiStudents]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleToggle = (id: string) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleSubmit = () => {
    onSubmit?.(selected);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-3xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">Chọn học viên</SheetTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isLoading || selected.length === 0}
                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {classData?.name && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>Lớp: {classData.name}</span>
              {selected.length > 0 && (
                <Badge variant="secondary" className="ml-2">Đã chọn {selected.length}</Badge>
              )}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên, email, số điện thoại, mã học viên"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </SheetHeader>

        <div className="mt-6">
          {isFetchingStudents ? (
            <Loading/>
          ) : current.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-gray-500">Không có học viên nào</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {current.map(s => (
                <div
                  key={s.id}
                  className={`rounded-lg border transition-all cursor-pointer overflow-hidden ${
                    selected.includes(s.id) ? 'border-blue-500 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleToggle(s.id)}
                >
                  <div className="bg-[#5B5BE0] text-white px-4 py-3 flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={s.avatar} alt={s.fullName} />
                      <AvatarFallback className="bg-white/20 text-white">
                        {getInitials(s.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-semibold truncate">{s.fullName}</div>
                    <div className="ml-auto">
                      <Checkbox
                        checked={selected.includes(s.id)}
                        onCheckedChange={() => handleToggle(s.id)}
                        onClick={(e: any) => e.stopPropagation()}
                        className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#5B5BE0]"
                      />
                    </div>
                  </div>
                  <div className="p-4 space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{s.email || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="pt-2 mt-2 border-t">
                      <div className="flex items-center gap-2 mb-1 text-gray-700">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Phụ huynh</span>
                      </div>
                      <div className="ml-6 space-y-1 text-gray-700">
                        <div className="text-sm">{s.parent?.fullName || 'Chưa cập nhật'}</div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-300" />
                          <span className="truncate">{s.parent?.email || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-300" />
                          <span>{s.parent?.phone || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between px-2 py-3 text-sm text-gray-600">
            <div>
              {total === 0 ? '0-0 trong 0' : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total)} trong ${total}`}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(Math.max(1, page - 1))}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SelectStudentSheet;


