// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Button } from '@/components/ui/button';
// import { Search, X } from 'lucide-react';
// import { useState } from 'react';

// interface ClassFiltersProps {
//     onFilterChange: (filters: any) => void;
//     subjects?: any[];
//     teachers?: any[];
// }

// export const ClassFilters = ({ onFilterChange, subjects = [], teachers = [] }: ClassFiltersProps) => {
//     const [search, setSearch] = useState('');
//     const [status, setStatus] = useState('');
//     const [grade, setGrade] = useState('');
//     const [subjectId, setSubjectId] = useState('');

//     const handleReset = () => {
//         setSearch('');
//         setStatus('');
//         setGrade('');
//         setSubjectId('');
//         onFilterChange({});
//     };

//     const handleApply = () => {
//         onFilterChange({
//             search,
//             status: status || undefined,
//             grade: grade || undefined,
//             subjectId: subjectId || undefined
//         });
//     };

//     return (
//         <div className="space-y-4">
//             <div className="flex gap-2">
//                 <div className="relative flex-1">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                     <Input
//                         placeholder="Tìm kiếm tên lớp..."
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         onKeyDown={(e) => e.key === 'Enter' && handleApply()}
//                         className="pl-10"
//                     />
//                 </div>
//                 <Button onClick={handleApply}>Tìm kiếm</Button>
//                 {(search || status || grade || subjectId) && (
//                     <Button variant="outline" onClick={handleReset}>
//                         <X className="h-4 w-4 mr-2" />
//                         Xóa bộ lọc
//                     </Button>
//                 )}
//             </div>

//             <div className="flex gap-4 flex-wrap">
//                 <Select value={status} onValueChange={setStatus}>
//                     <SelectTrigger className="w-[180px]">
//                         <SelectValue placeholder="Trạng thái" />
//                     </SelectTrigger>
//                     <SelectContent>
//                         <SelectItem value="">Tất cả</SelectItem>
//                         <SelectItem value="draft">Nháp</SelectItem>
//                         <SelectItem value="active">Đang hoạt động</SelectItem>
//                         <SelectItem value="completed">Hoàn thành</SelectItem>
//                     </SelectContent>
//                 </Select>

//                 <Select value={grade} onValueChange={setGrade}>
//                     <SelectTrigger className="w-[180px]">
//                         <SelectValue placeholder="Khối" />
//                     </SelectTrigger>
//                     <SelectContent>
//                         <SelectItem value="">Tất cả</SelectItem>
//                         <SelectItem value="6">Lớp 6</SelectItem>
//                         <SelectItem value="7">Lớp 7</SelectItem>
//                         <SelectItem value="8">Lớp 8</SelectItem>
//                         <SelectItem value="9">Lớp 9</SelectItem>
//                     </SelectContent>
//                 </Select>

//                 <Select value={subjectId} onValueChange={setSubjectId}>
//                     <SelectTrigger className="w-[180px]">
//                         <SelectValue placeholder="Môn học" />
//                     </SelectTrigger>
//                     <SelectContent>
//                         <SelectItem value="">Tất cả</SelectItem>
//                         {subjects && Array.isArray(subjects) && subjects.length > 0 && subjects
//                             .filter((subject: any) => subject?.id && subject?.name)
//                             .map((subject: any) => (
//                                 <SelectItem key={subject.id} value={String(subject.id)}>
//                                     {subject.name}
//                                 </SelectItem>
//                             ))}
//                     </SelectContent>
//                 </Select>
//             </div>
//         </div>
//     );
// };

