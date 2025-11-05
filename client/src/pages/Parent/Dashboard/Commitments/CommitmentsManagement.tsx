"use client"

import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, ChevronRight, Filter, FileText, Download, Eye, Trash2 } from "lucide-react";
import { UploadCommitmentDialog } from "./components/UploadCommitmentDialog";
import { DataTable, Column } from "../../../../components/common/Table/DataTable";
import { parentStudentsService } from "../../../../services/parent/students/students.service";
import { parentCommitmentsService, StudentCommitment } from "../../../../services/parent/commitments/commitments.service";
import { useToast } from "../../../../hooks/use-toast";
import { publicClassesService } from "../../../../services/common/public-classes.service";
import { CheckCircle2, Clock, XCircle } from "lucide-react";


export function CommitmentsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // all, active, expiring_soon, expired
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Link mẫu form cam kết học tập
  const COMMITMENT_FORM_URL = 'https://res.cloudinary.com/dgqkmqkdz/raw/upload/v1761971845/ban-cam-ket-cua-hoc-sinh-so-2_1603112518_wtpcg3.docx';

  // Fetch danh sách con
  const { data: studentsResponse, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["parent", "students"],
    queryFn: () => parentStudentsService.getChildren(),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const students = studentsResponse?.data || [];

  // Fetch danh sách hợp đồng của học sinh đã chọn
  const { data: commitmentsResponse, isLoading: isLoadingCommitments } = useQuery({
    queryKey: ["commitments", selectedStudentId],
    queryFn: () => parentCommitmentsService.getStudentCommitments(selectedStudentId),
    enabled: !!selectedStudentId,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const commitments = commitmentsResponse?.data || [];

  // Fetch subjects để hiển thị tên môn học
  const { data: subjectsResponse } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => publicClassesService.getSubjects(),
  });
  const subjects = subjectsResponse?.data || [];
  const subjectMap = new Map(subjects.map((s: any) => [s.id, s.name]));

  // Filter commitments theo status
  const filteredCommitments = useMemo(() => {
    let filtered = commitments as StudentCommitment[];
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    // Filter by search (search in file name or note)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        (c.uploadedImageName?.toLowerCase().includes(query)) ||
        (c.note?.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [commitments, statusFilter, searchQuery]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, selectedStudentId]);

  // Get student name
  const getStudentName = (studentId: string) => {
    const student = students.find((s: any) => s.id === studentId);
    return student?.user?.fullName  || 'N/A';
  };

  // Stats
  const stats = useMemo(() => {
    const all = commitments as StudentCommitment[];
    return {
      total: all.length,
      active: all.filter(c => c.status === 'active').length,
      expiringSoon: all.filter(c => c.status === 'expiring_soon').length,
      expired: all.filter(c => c.status === 'expired').length,
    };
  }, [commitments]);

  // Pagination
  const paginatedCommitments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCommitments.slice(start, end);
  }, [filteredCommitments, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCommitments.length / itemsPerPage);

  // Delete handler
  const handleDelete = async (commitmentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hợp đồng này? Hợp đồng đang được sử dụng sẽ không thể xóa.')) {
      return;
    }

    try {
      await parentCommitmentsService.deleteCommitment(commitmentId, selectedStudentId);
      toast({
        title: "Thành công",
        description: "Đã xóa hợp đồng thành công",
      });
      queryClient.invalidateQueries({ queryKey: ['commitments', selectedStudentId] });
      queryClient.invalidateQueries({ queryKey: ['commitments'] });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể xóa hợp đồng. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Không có';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Đang hoạt động
          </Badge>
        );
      case 'expiring_soon':
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            Sắp hết hạn
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Đã hết hạn
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Table columns
  const columns: Column<StudentCommitment>[] = [
    {
      key: 'uploadedImageName',
      header: 'Tên file',
      searchable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-medium">{item.uploadedImageName || 'Bản cam kết'}</span>
        </div>
      ),
    },
    {
      key: 'subjectIds',
      header: 'Môn học',
      render: (item) => {
        const subjectNames = item.subjectIds
          .map(id => subjectMap.get(id))
          .filter(Boolean)
          .join(', ') || 'N/A';
        return (
          <div className="flex flex-wrap gap-1">
            {item.subjectIds.map(subjectId => {
              const subjectName = subjectMap.get(subjectId);
              return subjectName ? (
                <Badge key={subjectId} variant="outline" className="text-xs">
                  {subjectName as string}
                </Badge>
              ) : null;
            })}
          </div>
        );
      },
    },
    {
      key: 'uploadedAt',
      header: 'Ngày upload',
      sortable: true,
      render: (item) => formatDate(item.uploadedAt),
    },
    {
      key: 'expiredAt',
      header: 'Hết hạn',
      sortable: true,
      render: (item) => {
        const isExpired = item.expiredAt && new Date(item.expiredAt) < new Date();
        return (
          <span className={isExpired ? 'text-red-600 font-medium' : ''}>
            {formatDate(item.expiredAt)}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: true,
      render: (item) => getStatusBadge(item.status),
    },
    {
      key: 'note',
      header: 'Ghi chú',
      searchable: true,
      render: (item) => item.note || '-',
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'center',
      width: '150px',
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(item.uploadedImageUrl, '_blank');
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.id);
            }}
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Quản lý cam kết học tập</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <span>Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span>Quản lý cam kết học tập</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng hợp đồng</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        {/* <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sắp hết hạn</p>
                <p className="text-2xl font-bold text-amber-600">{stats.expiringSoon}</p>
              </div>
              <FileText className="w-8 h-8 text-amber-600 opacity-50" />
            </div>
          </CardContent>
        </Card> */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đã hết hạn</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <FileText className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-end">
            {/* Student Selector */}
            <div className="md:col-span-3">
              <label className="text-sm font-medium mb-2 block">Chọn học sinh</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">-- Chọn học sinh để xem hợp đồng --</option>
                {students.map((student: any) => (
                  <option key={student.id} value={student.id}>
                    {student.user?.fullName || student.user?.username || 'N/A'}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="md:col-span-3">
              <label className="sr-only">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên file, ghi chú..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Lọc theo trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="expiring_soon">Sắp hết hạn</option>
                <option value="expired">Đã hết hạn</option>
              </select>
            </div>

            {/* Actions */}
            <div className="md:col-span-4 flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  window.open(COMMITMENT_FORM_URL, '_blank');
                }}
                className="w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Tải mẫu cam kết
              </Button>
              <Button
                onClick={() => setIsUploadDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload hợp đồng mới
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commitments List */}
      {!selectedStudentId ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-muted-foreground">
              Vui lòng chọn học sinh để xem hợp đồng cam kết
            </p>
          </CardContent>
        </Card>
      ) : isLoadingCommitments ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Đang tải hợp đồng...</p>
          </CardContent>
        </Card>
      ) : filteredCommitments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              {commitments.length === 0 
                ? "Học sinh này chưa có hợp đồng cam kết nào" 
                : "Không tìm thấy hợp đồng phù hợp"}
            </p>
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(true)}
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload hợp đồng đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          data={paginatedCommitments}
          columns={columns}
          loading={isLoadingCommitments}
          emptyMessage="Không có hợp đồng nào"
          pagination={{
            currentPage,
            totalPages,
            totalItems: filteredCommitments.length,
            itemsPerPage,
            onPageChange: setCurrentPage,
            onItemsPerPageChange: (newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            },
          }}
          rowKey={(item) => item.id}
          enableSearch={false}
        />
      )}

      {/* Upload Dialog */}
      <UploadCommitmentDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        studentId={selectedStudentId || undefined}
      />
    </div>
  );
}
