import { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, ArrowLeft, Check, ChevronLeft, ChevronRight, GraduationCap, Mail, Phone, UserPlus, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '../../../../../hooks/useDebounce';
import { apiClient } from '../../../../../utils/clientAxios';
import Loading from '../../../../../components/Loading/LoadingPage';
import { CodeDisplay } from '../../../../../components/common/CodeDisplay';

interface SelectTeacherSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData?: any;
  onSubmit?: (teacherId: string) => void;
  isLoading?: boolean;
}

interface TeacherItem {
  id: string;
  teacherCode: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: boolean;
  role: string;
  subjects?: string;
}

export const SelectTeacherSheet = ({
  open,
  onOpenChange,
  classData,
  onSubmit,
  isLoading = false
}: SelectTeacherSheetProps) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);
  console.log(classData);
  
  const { data, isLoading: isFetchingTeachers } = useQuery({
    queryKey: ['teachers-selection', { search: debouncedQuery || undefined, page, limit: pageSize, subject: classData?.subject.name, open }],
    queryFn: async () => {
      const params: any = {
        status: 'active', // Chỉ lấy giáo viên đang hoạt động
        page,
        limit: pageSize
      };
      
      if (debouncedQuery?.trim()) {
        params.search = debouncedQuery.trim();
      }
      
      // Thêm filter theo môn học của lớp
      if (classData?.subject) {
        params.subject = classData?.subject?.name;
      }
      
      const response = await apiClient.get('/admin-center/teachers', params);
      return response;
    },
    enabled: open,
    staleTime: 2000,
    refetchOnWindowFocus: true
  });

  const apiTeachers: any[] = (data as any)?.data || [];
  const total: number = (data as any)?.meta?.total || apiTeachers.length;
  const totalPages = (data as any)?.meta?.totalPages || Math.max(1, Math.ceil(total / pageSize));
  
  const current = useMemo(() => apiTeachers.map((t: any) => ({
    id: t.id,
    teacherCode: t.code || '',
    name: t.name || 'Không tên',
    email: t.email || '',
    phone: t.phone,
    avatar: t.avatar,
    status: t.status || false,
    role: t.role || 'Giáo viên',
    subjects: t.subjects || []
  })), [apiTeachers]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleSelectTeacher = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
  };

  const handleSubmit = () => {
    if (selectedTeacherId) {
      onSubmit?.(selectedTeacherId);
      onOpenChange(false);
      setSelectedTeacherId('');
      setQuery('');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-3xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">Chọn giáo viên cho lớp học</SheetTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  setSelectedTeacherId('');
                  setQuery('');
                }}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isLoading || !selectedTeacherId}
                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {classData?.name && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <GraduationCap className="w-4 h-4" />
              <span>Lớp: {classData.name}</span>
              {selectedTeacherId && (
                <Badge variant="secondary" className="ml-2">Đã chọn</Badge>
              )}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên, mã giáo viên (QNxxxxxx), email, SĐT..."
              value={query}
              onChange={(e ) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </SheetHeader>

        <div className="mt-6">
          {isFetchingTeachers ? (
            <Loading/>
          ) : current.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-gray-500">
              <div className="text-center">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  {query ? 'Không tìm thấy giáo viên' : 'Không có giáo viên nào'}
                </p>
                <p className="text-sm">
                  {query ? 'Thử tìm kiếm với từ khóa khác' : 'Vui lòng thêm giáo viên vào hệ thống'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {current.map(teacher => (
                <div
                  key={teacher.id}
                  className={`rounded-lg border transition-all cursor-pointer overflow-hidden ${
                    selectedTeacherId === teacher.id ? 'border-blue-500 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectTeacher(teacher.id)}
                >
                  <div className="bg-[#5B5BE0] text-white px-4 py-3 flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={teacher.avatar} alt={teacher.name} />
                      <AvatarFallback className="bg-white/20 text-white">
                        {getInitials(teacher.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold truncate">{teacher.name}</div>
                      <div className="text-xs opacity-90">{teacher.role}</div>
                    </div>
                    <div className="ml-auto">
                      {selectedTeacherId === teacher.id && (
                        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-[#5B5BE0]" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4 space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{teacher.email || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{teacher.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      <CodeDisplay code={teacher.teacherCode} hiddenLength={4} />
                    </div>
                    {teacher.subjects && teacher.subjects.length > 0 && (
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects.map((subject: string, idx: number) => (
                            <Badge 
                              key={idx}
                              variant="secondary" 
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="pt-2 mt-2 border-t flex justify-end">
                      <Badge 
                        variant={teacher.status ? "default" : "secondary"}
                        className={`text-xs ${
                          teacher.status 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {teacher.status ? 'Đang hoạt động' : 'Không hoạt động'}
                      </Badge>
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
              <span className="text-sm text-gray-600 px-2">
                {page} / {totalPages}
              </span>
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

export default SelectTeacherSheet;
