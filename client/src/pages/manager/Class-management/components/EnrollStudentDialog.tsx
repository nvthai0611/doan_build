// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Checkbox } from '@/components/ui/checkbox';
// import { useState, useEffect } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import {apiClient} from '../../../../utils/clientAxios';
// import { Search, Users } from 'lucide-react';

// interface EnrollStudentDialogProps {
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
//     onSubmit: (studentIds: string[]) => void;
//     classData: any;
//     isLoading?: boolean;
// }

// export const EnrollStudentDialog = ({ open, onOpenChange, onSubmit, classData, isLoading }: EnrollStudentDialogProps) => {
//     const [search, setSearch] = useState('');
//     const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

//     // Fetch available students (not enrolled in this class)
//     const { data: studentsData } = useQuery({
//         queryKey: ['availableStudents', classData?.id, search],
//         queryFn: async () => {
//             const response = await apiClient.get('/admin-center/students', {
//                 params: { search, limit: 50 }
//             });
//             return response.data;
//         },
//         enabled: open && !!classData
//     });

//     const students = studentsData as any[];
//     const availableSlots = classData?.maxStudents ? classData.maxStudents - classData.currentStudents : null;

//     const handleToggleStudent = (studentId: string) => {
//         setSelectedStudents((prev: string[]) =>
//             prev.includes(studentId)
//                 ? prev.filter((id) => id !== studentId)
//                 : [...prev, studentId]
//         );
//     };

//     const handleSubmit = () => {
//         onSubmit(selectedStudents);
//         setSelectedStudents([]);
//         setSearch('');
//     };

//     const handleCancel = () => {
//         setSelectedStudents([]);
//         setSearch('');
//         onOpenChange(false);
//     };

//     useEffect(() => {
//         if (!open) {
//             setSelectedStudents([]);
//             setSearch('');
//         }
//     }, [open]);

//     return (
//         <Dialog open={open} onOpenChange={onOpenChange}>
//             <DialogContent className="sm:max-w-[700px]">
//                 <DialogHeader>
//                     <DialogTitle>Thêm học sinh vào lớp</DialogTitle>
//                     {classData && (
//                         <div className="space-y-2 text-sm">
//                             <p className="text-gray-600">
//                                 Lớp: <span className="font-semibold">{classData.name}</span>
//                             </p>
//                             <div className="flex items-center gap-4">
//                                 <div className="flex items-center gap-2">
//                                     <Users className="h-4 w-4 text-gray-500" />
//                                     <span>
//                                         Sĩ số hiện tại: <span className="font-semibold">{classData.currentStudents}/{classData.maxStudents || '∞'}</span>
//                                     </span>
//                                 </div>
//                                 {availableSlots !== null && (
//                                     <div className={`font-semibold ${availableSlots > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                                         {availableSlots > 0 ? `Còn ${availableSlots} chỗ` : 'Đã đầy'}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     )}
//                 </DialogHeader>

//                 <div className="space-y-4 py-4">
//                     {/* Search Input */}
//                     <div className="relative">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                         <Input
//                             placeholder="Tìm kiếm học sinh theo tên, email..."
//                             value={search}
//                             onChange={(e: any) => setSearch(e.target.value)}
//                             className="pl-10"
//                         />
//                     </div>

//                     {/* Selected Count */}
//                     {selectedStudents.length > 0 && (
//                         <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
//                             <span className="text-sm font-medium text-blue-900">
//                                 Đã chọn {selectedStudents.length} học sinh
//                             </span>
//                             <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 onClick={() => setSelectedStudents([])}
//                                 className="text-blue-700 hover:text-blue-900"
//                             >
//                                 Bỏ chọn tất cả
//                             </Button>
//                         </div>
//                     )}

//                     {/* Students List */}
//                     <div className="border rounded-lg max-h-[400px] overflow-y-auto">
//                         {students.length === 0 ? (
//                             <div className="text-center py-8 text-gray-500">
//                                 {search ? 'Không tìm thấy học sinh' : 'Chưa có học sinh'}
//                             </div>
//                         ) : (
//                             <div className="divide-y">
//                                 {students.map((student: any) => (
//                                     <div
//                                         key={student.id}
//                                         className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer"
//                                         onClick={() => handleToggleStudent(student.id)}
//                                     >
//                                         <Checkbox
//                                             checked={selectedStudents.includes(student.id)}
//                                             onCheckedChange={() => handleToggleStudent(student.id)}
//                                         />
//                                         <div className="flex-1">
//                                             <div className="font-medium">{student.user?.fullName || student.fullName}</div>
//                                             <div className="text-sm text-gray-500">{student.user?.email || student.email}</div>
//                                             {student.studentCode && (
//                                                 <div className="text-xs text-gray-400">Mã: {student.studentCode}</div>
//                                             )}
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 <DialogFooter>
//                     <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
//                         Hủy
//                     </Button>
//                     <Button
//                         onClick={handleSubmit}
//                         disabled={isLoading || selectedStudents.length === 0 || (availableSlots !== null && selectedStudents.length > availableSlots)}
//                     >
//                         {isLoading ? 'Đang thêm...' : `Thêm ${selectedStudents.length} học sinh`}
//                     </Button>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>
//     );
// };
