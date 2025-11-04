'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Loading from '../../../components/Loading/LoadingPage';
import {
  Breadcrumb,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, User, Calendar, Clock, MapPin, Link as LinkIcon, Video, FileText } from 'lucide-react';
import { centerOwnerScheduleService } from '../../../services/center-owner/center-schedule/schedule.service';
import { StudentsTab } from './components/StudentsTab';
import { format } from 'date-fns';
import { SESSION_STATUS_LABELS, getStatusLabel } from '../../../lib/constants';

export default function SessionDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = params.sessionId as string;

  const [activeTab, setActiveTab] = useState('general');

  // Check for hash in URL to set active tab
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && ['general', 'teacher', 'students'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  const { data: sessionDetailResponse, isLoading, error } = useQuery({
    queryKey: ['sessionDetail', sessionId],
    queryFn: () => centerOwnerScheduleService.getSessionById(sessionId),
    enabled: !!sessionId,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  const { data: attendanceResponse, isLoading: attendanceLoading } = useQuery({
    queryKey: ['sessionAttendance', sessionId],
    queryFn: () => centerOwnerScheduleService.getSessionAttendance(sessionId),
    enabled: !!sessionId,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  const sessionData = sessionDetailResponse as any;
  const attendanceData = attendanceResponse as any;

  // Map attendance data to students (CHỈ CÓ 3 TRẠNG THÁI: present, absent, excused)
  const students = attendanceData?.map((attendance: any) => ({
    id: attendance.studentId || attendance.id,
    name: attendance.student?.user?.fullName || attendance.studentName || 'N/A',
    email: attendance.student?.user?.email || '',
    avatar: attendance.student?.user?.avatar || null,
    status: attendance.status || 'absent', // Mặc định là vắng mặt nếu chưa có dữ liệu
    attendanceTime: attendance.checkInTime 
      ? `${format(new Date(attendance.checkInTime), 'HH:mm')} → ${attendance.checkOutTime ? format(new Date(attendance.checkOutTime), 'HH:mm') : '—'}` 
      : '—',
    thaiDoHoc: attendance.thaiDoHoc || null,
    kyNangLamViecNhom: attendance.kyNangLamViecNhom || null,
  })) || [];

  // Loading state
  if (isLoading) {
    return <Loading />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Lỗi tải dữ liệu
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Không thể tải thông tin buổi học
          </p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'general', label: 'Thông tin chung' },
    { key: 'teacher', label: 'Giáo viên' },
    { key: 'students', label: 'Học viên' },
  ];

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      happening: 'bg-green-100 text-green-800',
      end: 'bg-red-100 text-red-800',
      has_not_happened: 'bg-blue-100 text-blue-800',
      day_off: 'bg-orange-100 text-orange-800',
    };
    
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {getStatusLabel(status, SESSION_STATUS_LABELS)}
      </Badge>
    );
  };

  const renderTabContent = () => {
    if (!sessionData) return null;
    
    switch (activeTab) {
      case 'general':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Thông tin buổi học */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Tên buổi học
                    </h3>
                    <p className="text-lg font-semibold">{sessionData.name || sessionData.topic || 'Chưa cập nhật'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Ngày học
                    </h3>
                    <p className="text-base">
                      {sessionData.sessionDate 
                        ? format(new Date(sessionData.sessionDate), 'dd/MM/yyyy')
                        : 'Chưa cập nhật'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Thời gian
                    </h3>
                    <p className="text-base">
                      {sessionData.startTime && sessionData.endTime
                        ? `${sessionData.startTime} → ${sessionData.endTime}`
                        : 'Chưa cập nhật'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Trạng thái</h3>
                    <div>{getStatusBadge(sessionData.status)}</div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Phòng học
                    </h3>
                    <p className="text-base">{sessionData.room?.name || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                {/* Giáo viên */}
                {sessionData.teacher && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Giáo viên phụ trách
                    </h3>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={sessionData.teacher.user?.avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {sessionData.teacher.user?.fullName
                            ?.split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{sessionData.teacher.user?.fullName}</p>
                        <p className="text-sm text-gray-500">{sessionData.teacher.user?.email}</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </CardContent>
          </Card>
        );
      case 'teacher':
        return (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Thông tin giáo viên</h3>
              {sessionData.teacher ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={sessionData.teacher.user?.avatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                        {sessionData.teacher.user?.fullName
                          ?.split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xl font-semibold">{sessionData.teacher.user?.fullName}</p>
                      <p className="text-gray-500">{sessionData.teacher.user?.email}</p>
                      <p className="text-sm text-gray-500">{sessionData.teacher.user?.phoneNumber}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Chưa có thông tin giáo viên</p>
              )}
            </CardContent>
          </Card>
        );
      case 'students':
        return attendanceLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">Đang tải danh sách học viên...</p>
            </CardContent>
          </Card>
        ) : (
          <StudentsTab students={students} />
        );
      default:
        return (
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">Chức năng đang được phát triển</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6">
        {/* Breadcrumbs */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            {sessionData?.name || sessionData?.topic || 'Chi tiết buổi học'}
          </h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/center-qn"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => navigate(-1)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Chi tiết lớp học
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => navigate(-1)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Danh sách buổi học
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">
                  {sessionData?.name || sessionData?.topic || 'Buổi học'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Tabs */}
        <div className="mt-4">
          <nav className="flex space-x-8 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  window.history.replaceState(null, '', `#${tab.key}`);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'general' ? (
          // Layout 2 cột cho tab "Thông tin chung" (có sidebar)
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Left side (2/3) */}
            <div className="lg:col-span-2">
              {renderTabContent()}
            </div>

            {/* Sidebar - Right side (1/3) */}
            <div className="space-y-6">
              {/* Báo cáo buổi học */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Báo cáo buổi học</h3>
                  
                  <div className="space-y-4">
                    {/* Học viên */}
                    <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-1">
                          {students.length || 0}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                          <Users className="w-4 h-4" />
                          Học viên
                        </div>
                      </div>
                    </div>

                    {/* Giáo viên */}
                    <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-600 mb-1">
                          {sessionData?.teacher ? 1 : 0}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                          <User className="w-4 h-4" />
                          Giáo viên
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Layout full width cho các tab khác (không có sidebar)
          <div>
            {renderTabContent()}
          </div>
        )}
      </div>
    </div>
  );
}
